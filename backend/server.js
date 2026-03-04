const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const updatesRoutes = require('./routes/updates');
const clerkRoutes = require('./routes/clerk');
const studyMaterialRoutes = require('./routes/studyMaterial');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/clerk', clerkRoutes);
app.use('/api/public/study-material', studyMaterialRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date()
    });
});

// Welcome Route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Dr. Indu Dayal Meshri Institute Backend API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            students: '/api/students',
            updates: '/api/updates'
        }
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║  DIDM Institute Backend Server        ║
    ║  Running on http://localhost:${PORT}     ║
    ║  Database: ${process.env.DB_HOST}         ║
    ║  Node Env: ${process.env.NODE_ENV}        ║
    ╚════════════════════════════════════════╝
    `);
});

module.exports = app;
