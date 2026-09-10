const express = require('express');
const cors = require('cors');

const { corsOrigin } = require('./config/env');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(
    cors({
        origin: corsOrigin,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Stockly API is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);

module.exports = app;

