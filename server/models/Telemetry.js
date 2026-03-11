const mongoose = require('mongoose');

/**
 * Telemetry Schema
 * Stores sensor readings from the ESP32 device.
 */
const telemetrySchema = new mongoose.Schema({
    voltage: {
        type: Number,
        required: true,
        min: 0,
        max: 30 
    },
    current: {
        type: Number,
        required: true,
        min: -50, 
        max: 50   
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
        index: true 
    }
});

// Create compound index for efficient history queries
telemetrySchema.index({ timestamp: -1 });

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;