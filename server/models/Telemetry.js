const mongoose = require('mongoose');

/**
 * Telemetry Schema
 * 
 * Stores sensor readings from the ESP32 device.
 * Each document represents a single measurement at a point in time.
 * 
 * Fields:
 * - voltage: Battery voltage reading from the voltage sensor (V)
 * - current: Current draw reading from the current sensor (A)
 * - batteryLevel: Estimated battery percentage (calculated from voltage)
 * - powerSource: Indicates whether system is running on SOLAR or GRID
 * - timestamp: When the reading was taken (auto-generated)
 */
const telemetrySchema = new mongoose.Schema({
    voltage: {
        type: Number,
        required: true,
        min: 0,
        max: 30 // Reasonable max for a 12V system
    },
    current: {
        type: Number,
        required: true,
        min: -50, // Negative for discharge
        max: 50   // Reasonable max for home solar
    },
    batteryLevel: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    powerSource: {
        type: String,
        enum: ['SOLAR', 'GRID'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Index for efficient time-based queries
    }
});

// Create compound index for efficient history queries
telemetrySchema.index({ timestamp: -1 });

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;
