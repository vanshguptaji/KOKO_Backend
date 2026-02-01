/**
 * Appointment Routes
 * API endpoints for appointment management
 */

const express = require('express');
const router = express.Router();
const { AppointmentController } = require('../controllers');

// ==========================================
// Public Routes (for booking)
// ==========================================

/**
 * @route   GET /api/appointments/services
 * @desc    Get available services and pet types
 * @access  Public
 */
router.get('/services', AppointmentController.getServices);

/**
 * @route   GET /api/appointments/available-dates
 * @desc    Get available dates for the next N days
 * @access  Public
 * @query   days - Number of days to look ahead (default: 14)
 */
router.get('/available-dates', AppointmentController.getAvailableDates);

/**
 * @route   GET /api/appointments/available-slots/:date
 * @desc    Get available time slots for a specific date
 * @access  Public
 */
router.get('/available-slots/:date', AppointmentController.getAvailableSlots);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Public
 * @body    { ownerName, petName, petType?, phone, email?, service?, scheduledDate, scheduledTimeSlot, reason?, notes? }
 */
router.post('/', AppointmentController.createAppointment);

/**
 * @route   GET /api/appointments/session/:sessionId
 * @desc    Get appointments by chatbot session
 * @access  Public
 */
router.get('/session/:sessionId', AppointmentController.getBySession);

// ==========================================
// Admin Routes (for management)
// ==========================================

/**
 * @route   GET /api/appointments/stats
 * @desc    Get appointment statistics
 * @access  Admin
 */
router.get('/stats', AppointmentController.getStats);

/**
 * @route   GET /api/appointments/today
 * @desc    Get today's appointments
 * @access  Admin
 */
router.get('/today', AppointmentController.getTodaysAppointments);

/**
 * @route   GET /api/appointments/upcoming
 * @desc    Get upcoming appointments
 * @access  Admin
 * @query   limit - Number of appointments to return (default: 10)
 */
router.get('/upcoming', AppointmentController.getUpcomingAppointments);

/**
 * @route   GET /api/appointments/date/:date
 * @desc    Get appointments for a specific date
 * @access  Admin
 */
router.get('/date/:date', AppointmentController.getByDate);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments with filters
 * @access  Admin
 * @query   page, limit, status, date, startDate, endDate, search, sortBy, sortOrder
 */
router.get('/', AppointmentController.getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Admin
 */
router.get('/:id', AppointmentController.getAppointment);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  Admin
 * @body    { ownerName?, petName?, petType?, phone?, email?, service?, scheduledDate?, scheduledTimeSlot?, reason?, notes?, status? }
 */
router.put('/:id', AppointmentController.updateAppointment);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Admin
 * @body    { status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' }
 */
router.patch('/:id/status', AppointmentController.updateStatus);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Admin/User
 * @body    { reason?: string }
 */
router.patch('/:id/cancel', AppointmentController.cancelAppointment);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete an appointment permanently
 * @access  Admin
 */
router.delete('/:id', AppointmentController.deleteAppointment);

module.exports = router;
