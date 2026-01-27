/**
 * SolarNode IoT Backend Server
 * 
 * This Express server provides the backend API for the SolarNode IoT project.
 * It handles:
 * - Receiving telemetry data from the ESP32 device
 * - Providing live and historical data to the React dashboard
 * - Managing relay control state
 * - User Authentication (Login / Request Access)
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const telemetryRoutes = require('./routes/telemetry');
const authRoutes = require('./routes/auth');

const app = express();

// ============================================================
// Configuration
// ============================================================
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solarnode';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('WARNING: JWT_SECRET is not set! Using insecure default.');
}

// ============================================================
// Middleware
// ============================================================

// Parse JSON request bodies
app.use(express.json());

// Configure CORS
const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================
// Routes
// ============================================================

// Mount API routes
app.use('/api', telemetryRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'SolarNode IoT Backend',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: 'GET /api/health',
            authLogin: 'POST /api/auth/login',
            iotUpdate: 'POST /api/iot/update'
        }
    });
});

// ============================================================
// Error Handling
// ============================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    if (err.message === 'Not allowed by CORS') return res.status(403).json({ success: false, error: 'CORS policy violation' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, error: 'Invalid JSON' });
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// ============================================================
// Database Connection & Server Start
// ============================================================

async function startServer() {
    try {
        // Connect to MongoDB
        console.log('[Database] Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('[Database] Connected successfully!');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('[Fatal] Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[Server] Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('[Database] Connection closed');
    process.exit(0);
});

startServer();