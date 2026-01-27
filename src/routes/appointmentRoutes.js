/**
 * Appointment Routes
 * API endpoints for appointment management
 */

const express = require('express');
const router = express.Router();
const { AppointmentController } = require('../controllers');

/**
 * @route   GET /api/appointments/stats
 * @desc    Get appointment statistics
 * @access  Admin
 */
router.get('/stats', AppointmentController.getStats);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Admin
 */
router.get('/', AppointmentController.getAllAppointments);

/**
 * @route   GET /api/appointments/session/:sessionId
 * @desc    Get appointments by session
 * @access  Public
 */
router.get('/session/:sessionId', AppointmentController.getBySession);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Admin
 */
router.get('/:id', AppointmentController.getAppointment);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Admin
 */
router.patch('/:id/status', AppointmentController.updateStatus);

module.exports = router;
