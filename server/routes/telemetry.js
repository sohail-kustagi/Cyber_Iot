const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const SystemState = require('../models/SystemState');

/**
 * Helper function to calculate battery level from voltage
 * 
 * Uses a simple linear approximation for a 12V lead-acid battery:
 * - 12.7V or higher = 100% (fully charged)
 * - 11.6V or lower = 0% (discharged, should not go lower)
 * 
 * Adjust these values based on your specific battery type.
 */
function calculateBatteryLevel(voltage) {
    const VOLTAGE_FULL = 12.6;  // 100% charge (3S Li-Ion)
    const VOLTAGE_EMPTY = 9.6;  // 0% charge (3S Li-Ion low cutoff)

    if (voltage >= VOLTAGE_FULL) return 100;
    if (voltage <= VOLTAGE_EMPTY) return 0;

    // Linear interpolation between empty and full
    const percentage = ((voltage - VOLTAGE_EMPTY) / (VOLTAGE_FULL - VOLTAGE_EMPTY)) * 100;
    return Math.round(percentage);
}

/**
 * Helper function to ensure SystemState document exists
 * Creates a default state if none exists (singleton pattern)
 */
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
// This endpoint is called by the ESP32 device to send telemetry data.
// 
// PIGGYBACK CONTROL PATTERN:
// The response includes the current relay status, so the ESP32
// knows whether to switch the relay without making a separate request.
//
// Request Body: { "voltage": 12.6, "current": 2.1 }
// Response: { "success": true, "targetRelayState": true }
// ============================================================
router.post('/iot/update', async (req, res) => {
    try {
        const { voltage, current } = req.body;

        // Validate required fields
        if (typeof voltage !== 'number' || typeof current !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. Both voltage and current must be numbers.'
            });
        }

        // Get current system state to determine power source
        const systemState = await getOrCreateSystemState();

        // Calculate derived values
        const batteryLevel = calculateBatteryLevel(voltage);
        const powerSource = systemState.relayStatus ? 'SOLAR' : 'GRID';

        // Save telemetry data to database
        const telemetry = await Telemetry.create({
            voltage,
            current,
            batteryLevel,
            powerSource
        });

        console.log(`[IoT] Received telemetry: ${voltage}V, ${current}A, Battery: ${batteryLevel}%, Source: ${powerSource}`);

        // CRITICAL: Include relay status in response for ESP32 to read
        // This is the "piggyback" - ESP32 gets its command in the POST response
        res.json({
            success: true,
            targetRelayState: systemState.relayStatus,
            recorded: {
                voltage,
                current,
                batteryLevel,
                powerSource,
                timestamp: telemetry.timestamp
            }
        });

    } catch (error) {
        console.error('[IoT] Error processing update:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process telemetry data'
        });
    }
});

// ============================================================
// POST /api/telemetry (LEGACY ESP32 COMPATIBILITY)
// ============================================================
// This endpoint supports the ESP32 code that is hardcoded to use:
// - Endpoint: /api/telemetry
// - Response key: inverterRelayOn
//
// Logic is identical to /api/iot/update but adapts the interface.
// ============================================================
router.post('/telemetry', async (req, res) => {
    try {
        const { voltage, current } = req.body;
        console.log(`[ESP32 Legacy] Received: ${voltage}V, ${current}A`);

        // Validate required fields
        if (typeof voltage !== 'number' || typeof current !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. Both voltage and current must be numbers.'
            });
        }

        // Get current system state
        const systemState = await getOrCreateSystemState();

        // Calculate derived values
        const batteryLevel = calculateBatteryLevel(voltage);
        const powerSource = systemState.relayStatus ? 'SOLAR' : 'GRID';

        // Save telemetry data to database (same Telemetry model)
        await Telemetry.create({
            voltage,
            current,
            batteryLevel,
            powerSource
        });

        // CRITICAL: Return "inverterRelayOn" to match ESP32 expectations
        res.json({
            success: true,
            inverterRelayOn: systemState.relayStatus
        });

    } catch (error) {
        console.error('[ESP32 Legacy] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process telemetry data'
        });
    }
});

// ============================================================
// GET /api/dashboard/live
// ============================================================
// Returns the most recent telemetry entry and current system state.
// Used by the React Dashboard to display real-time metrics.
//
// Response: {
//   "telemetry": { voltage, current, batteryLevel, powerSource, timestamp },
//   "systemState": { relayStatus, lastUpdated }
// }
// ============================================================
router.get('/dashboard/live', async (req, res) => {
    try {
        // Get most recent telemetry entry
        const telemetry = await Telemetry.findOne()
            .sort({ timestamp: -1 })
            .lean();

        // Get current system state
        const systemState = await getOrCreateSystemState();

        res.json({
            success: true,
            telemetry: telemetry || null,
            systemState: {
                relayStatus: systemState.relayStatus,
                lastUpdated: systemState.lastUpdated
            }
        });

    } catch (error) {
        console.error('[Dashboard] Error fetching live data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch live data'
        });
    }
});

// ============================================================
// GET /api/dashboard/history
// ============================================================
// Returns the last 50 telemetry entries for historical graphs.
// Sorted by timestamp descending (newest first).
//
// Query params:
// - limit: number of entries to return (default: 50, max: 500)
//
// Response: {
//   "history": [ { voltage, current, batteryLevel, powerSource, timestamp }, ... ]
// }
// ============================================================
router.get('/dashboard/history', async (req, res) => {
    try {
        // Parse limit from query params, default to 50, max 500
        let limit = parseInt(req.query.limit) || 50;
        limit = Math.min(Math.max(limit, 1), 500);

        // Get historical telemetry data
        const history = await Telemetry.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            count: history.length,
            history
        });

    } catch (error) {
        console.error('[Dashboard] Error fetching history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch history data'
        });
    }
});

// ============================================================
// COMPATIBILITY ROUTES (User Reference Support)
// ============================================================

// GET /api/dashboard
// Matches user's reference: returns { telemetry: ..., system: { inverterRelayOn: ... } }
router.get('/dashboard', async (req, res) => {
    try {
        const telemetry = await Telemetry.findOne().sort({ timestamp: -1 }).lean();
        const systemState = await getOrCreateSystemState();
        res.json({
            telemetry: telemetry || null,
            system: {
                inverterRelayOn: systemState.relayStatus
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Error' });
    }
});

// POST /api/control
// Matches user's reference: accepts { inverterRelayOn: boolean }
router.post('/control', async (req, res) => {
    try {
        const { inverterRelayOn } = req.body;
        if (typeof inverterRelayOn !== 'boolean') {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const systemState = await SystemState.findOneAndUpdate(
            {}, { relayStatus: inverterRelayOn },
            { new: true, upsert: true }
        );
        console.log(`[Control Ref] Relay updated to: ${inverterRelayOn}`);
        res.json({ success: true, inverterRelayOn: systemState.relayStatus });
    } catch (error) {
        res.status(500).json({ error: 'Internal Error' });
    }
});

// ============================================================
// POST /api/control/relay
// ============================================================
// Updates the relay state in the database.
// Called by the React Dashboard toggle switch.
//
// The ESP32 will receive this new state on its next telemetry POST.
//
// Request Body: { "state": true/false }
// Response: { "success": true, "relayStatus": true }
// ============================================================
router.post('/control/relay', async (req, res) => {
    try {
        const { state } = req.body;

        // Validate state is a boolean
        if (typeof state !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. State must be a boolean (true/false).'
            });
        }

        // Update or create system state
        const systemState = await SystemState.findOneAndUpdate(
            {}, // Match any document (singleton)
            { relayStatus: state },
            {
                new: true,      // Return updated document
                upsert: true,   // Create if doesn't exist
                runValidators: true
            }
        );

        console.log(`[Control] Relay state updated to: ${state ? 'ON (Battery)' : 'OFF (Grid)'}`);

        res.json({
            success: true,
            relayStatus: systemState.relayStatus,
            lastUpdated: systemState.lastUpdated
        });

    } catch (error) {
        console.error('[Control] Error updating relay state:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update relay state'
        });
    }
});

// ============================================================
// GET /api/health
// ============================================================
// Health check endpoint for monitoring and deployment verification
// ============================================================
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
