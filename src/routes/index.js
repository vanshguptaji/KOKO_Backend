/**
 * Routes Index
 * Central router configuration
 */

const express = require('express');
const router = express.Router();
const chatRoutes = require('./chatRoutes');
const appointmentRoutes = require('./appointmentRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Veterinary Chatbot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount routes
router.use('/chat', chatRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;
