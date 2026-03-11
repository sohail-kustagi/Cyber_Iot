const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const SystemState = require('../models/SystemState');

function calculateBatteryLevel(voltage) {
    const VOLTAGE_FULL = 12.6;  
    const VOLTAGE_EMPTY = 9.6;  

    if (voltage >= VOLTAGE_FULL) return 100;
    if (voltage <= VOLTAGE_EMPTY) return 0;

    const percentage = ((voltage - VOLTAGE_EMPTY) / (VOLTAGE_FULL - VOLTAGE_EMPTY)) * 100;
    return Math.round(percentage);
}

async function getOrCreateSystemState() {
    let state = await SystemState.findOne();
    if (!state) {
        state = await SystemState.create({ relayStatus: true });
    }
    return state;
}

// ============================================================
// POST /api/iot/update
// ============================================================
router.post('/iot/update', async (req, res) => {
    try {
        const { voltage, current = 0 } = req.body; // Added safety fallback here too

        if (typeof voltage !== 'number') {
            return res.status(400).json({ success: false, error: 'Invalid request. Voltage must be a number.' });
        }

        const systemState = await getOrCreateSystemState();
        const batteryLevel = calculateBatteryLevel(voltage);
        const powerSource = systemState.relayStatus ? 'SOLAR' : 'GRID';

        const telemetry = await Telemetry.create({ voltage, current, batteryLevel, powerSource });

        res.json({
            success: true,
            targetRelayState: systemState.relayStatus,
            recorded: { voltage, current, batteryLevel, powerSource, timestamp: telemetry.timestamp }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to process telemetry data' });
    }
});

// ============================================================
// POST /api/telemetry (LEGACY ESP32 COMPATIBILITY)
// ============================================================
router.post('/telemetry', async (req, res) => {
    try {
        // We set a default value of 0 for current if it is missing
        const { voltage, current = 0 } = req.body;
        console.log(`[ESP32 Legacy] Received: ${voltage}V, ${current}A`);

        if (typeof voltage !== 'number') {
            return res.status(400).json({ success: false, error: 'Invalid request. Voltage must be a number.' });
        }

        const systemState = await getOrCreateSystemState();
        const batteryLevel = calculateBatteryLevel(voltage);
        const powerSource = systemState.relayStatus ? 'SOLAR' : 'GRID';

        await Telemetry.create({ voltage, current, batteryLevel, powerSource });

        res.json({ success: true, inverterRelayOn: systemState.relayStatus });
    } catch (error) {
        console.error('[ESP32 Legacy] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to process telemetry data' });
    }
});

// ============================================================
// GET /api/dashboard/live
// ============================================================
router.get('/dashboard/live', async (req, res) => {
    try {
        const telemetry = await Telemetry.findOne().sort({ timestamp: -1 }).lean();
        const systemState = await getOrCreateSystemState();

        res.json({
            success: true,
            telemetry: telemetry || null,
            systemState: { relayStatus: systemState.relayStatus, lastUpdated: systemState.lastUpdated }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch live data' });
    }
});

// ============================================================
// GET /api/dashboard/history
// ============================================================
router.get('/dashboard/history', async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 50;
        limit = Math.min(Math.max(limit, 1), 500);

        const history = await Telemetry.find().sort({ timestamp: -1 }).limit(limit).lean();
        res.json({ success: true, count: history.length, history });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch history data' });
    }
});

// ============================================================
// COMPATIBILITY ROUTES (User Reference Support)
// ============================================================
router.get('/dashboard', async (req, res) => {
    try {
        const telemetry = await Telemetry.findOne().sort({ timestamp: -1 }).lean();
        const systemState = await getOrCreateSystemState();
        res.json({ telemetry: telemetry || null, system: { inverterRelayOn: systemState.relayStatus } });
    } catch (error) {
        res.status(500).json({ error: 'Internal Error' });
    }
});

router.post('/control', async (req, res) => {
    try {
        const { inverterRelayOn } = req.body;
        if (typeof inverterRelayOn !== 'boolean') return res.status(400).json({ error: 'Invalid request' });
        
        const systemState = await SystemState.findOneAndUpdate({}, { relayStatus: inverterRelayOn }, { new: true, upsert: true });
        res.json({ success: true, inverterRelayOn: systemState.relayStatus });
    } catch (error) {
        res.status(500).json({ error: 'Internal Error' });
    }
});

router.post('/control/relay', async (req, res) => {
    try {
        const { state } = req.body;
        if (typeof state !== 'boolean') return res.status(400).json({ success: false, error: 'Invalid request. State must be a boolean (true/false).' });

        const systemState = await SystemState.findOneAndUpdate({}, { relayStatus: state }, { new: true, upsert: true, runValidators: true });
        res.json({ success: true, relayStatus: systemState.relayStatus, lastUpdated: systemState.lastUpdated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update relay state' });
    }
});

router.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = router;