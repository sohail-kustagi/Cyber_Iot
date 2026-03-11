// ============================================================
// POST /api/telemetry (LEGACY ESP32 COMPATIBILITY)
// ============================================================
router.post('/telemetry', async (req, res) => {
    try {
        // We set a default value of 0 for current if it is missing
        const { voltage, current = 0 } = req.body;
        console.log(`[ESP32 Legacy] Received: ${voltage}V, ${current}A`);

        // Validate required fields (Only voltage is strictly required now)
        if (typeof voltage !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. Voltage must be a number.'
            });
        }

        // Get current system state
        const systemState = await getOrCreateSystemState();

        // Calculate derived values
        const batteryLevel = calculateBatteryLevel(voltage);
        const powerSource = systemState.relayStatus ? 'SOLAR' : 'GRID';

        // Save telemetry data to database
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