const mongoose = require('mongoose');

/**
 * SystemState Schema
 * 
 * Stores the current state of the relay and system controls.
 * This is a singleton document - there should only be one in the collection.
 * 
 * The relayStatus field is the key control mechanism:
 * - true: Relay is ON, system runs on Battery/Solar
 * - false: Relay is OFF, system runs on Grid power
 * 
 * PIGGYBACK CONTROL PATTERN:
 * When the ESP32 sends telemetry data (POST /api/iot/update),
 * the response includes the current relayStatus. This way,
 * the device gets its command without making a separate request.
 */
const systemStateSchema = new mongoose.Schema({
    relayStatus: {
        type: Boolean,
        required: true,
        default: true // Default to battery/solar mode
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to auto-update lastUpdated timestamp
systemStateSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

// Pre-findOneAndUpdate middleware to auto-update lastUpdated
systemStateSchema.pre('findOneAndUpdate', function (next) {
    this.set({ lastUpdated: new Date() });
    next();
});

const SystemState = mongoose.model('SystemState', systemStateSchema);

module.exports = SystemState;
