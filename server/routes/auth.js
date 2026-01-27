const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AccessRequest = require('../models/AccessRequest');

// Secret key for JWT (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// ============================================================
// POST /api/auth/login
// ============================================================
// Authenticates specific user and returns JWT token
// Request Body: { "email": "admin@solarnode.io", "password": "..." }
// Response: { "success": true, "token": "...", "user": { ... } }
// ============================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate JWT Token
        // Payload includes user ID and role
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

// ============================================================
// POST /api/auth/request-access
// ============================================================
// Submits a new access request to the database
// Request Body: { "name": "...", "email": "...", "reason": "..." }
// Response: { "success": true, "message": "Request submitted" }
// ============================================================
router.post('/request-access', async (req, res) => {
    try {
        const { name, email, reason } = req.body;

        if (!name || !email || !reason) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Check if request already exists
        const existingRequest = await AccessRequest.findOne({ email });
        if (existingRequest) {
            return res.status(409).json({ success: false, error: 'Request already exists for this email' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'User already has an account' });
        }

        await AccessRequest.create({
            name,
            email,
            reason
        });

        res.status(201).json({
            success: true,
            message: 'Access request submitted successfully. Admin will review shortly.'
        });

    } catch (error) {
        console.error('[Auth] Request Access error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit request' });
    }
});

module.exports = router;
