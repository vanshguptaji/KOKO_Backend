/**
 * Appointment Controller
 * Handles appointment-related HTTP requests
 */

const { AppointmentService } = require('../services');
const { SERVICES, PET_TYPES, APPOINTMENT_STATUS } = require('../config/constants');

class AppointmentController {
  /**
   * GET /api/appointments
   * Get all appointments with filters
   */
  static async getAllAppointments(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        date,
        startDate,
        endDate,
        search,
        sortBy = 'scheduledDate',
        sortOrder = 'asc',
      } = req.query;

      const result = await AppointmentService.getAllAppointments({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status: status || null,
        date: date || null,
        startDate: startDate || null,
        endDate: endDate || null,
        search: search || null,
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          appointments: result.appointments,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/today
   * Get today's appointments
   */
  static async getTodaysAppointments(req, res) {
    try {
      const result = await AppointmentService.getTodaysAppointments();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.appointments,
      });
    } catch (error) {
      console.error('Get today\'s appointments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/upcoming
   * Get upcoming appointments
   */
  static async getUpcomingAppointments(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await AppointmentService.getUpcomingAppointments(parseInt(limit, 10));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.appointments,
      });
    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/date/:date
   * Get appointments for a specific date
   */
  static async getByDate(req, res) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date is required',
        });
      }

      const result = await AppointmentService.getAppointmentsByDate(date);

      return res.status(200).json({
        success: true,
        data: result.appointments || [],
      });
    } catch (error) {
      console.error('Get appointments by date error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/available-slots/:date
   * Get available time slots for a date
   */
  static async getAvailableSlots(req, res) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date is required',
        });
      }

      const result = await AppointmentService.getAvailableSlots(date);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/available-dates
   * Get available dates for the next N days
   */
  static async getAvailableDates(req, res) {
    try {
      const { days = 14 } = req.query;

      const result = await AppointmentService.getAvailableDates(parseInt(days, 10));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.dates,
      });
    } catch (error) {
      console.error('Get available dates error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/services
   * Get available services
   */
  static async getServices(req, res) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          services: SERVICES,
          petTypes: PET_TYPES,
          statuses: Object.values(APPOINTMENT_STATUS),
        },
      });
    } catch (error) {
      console.error('Get services error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/:id
   * Get appointment by ID
   */
  static async getAppointment(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required',
        });
      }

      const result = await AppointmentService.getAppointment(id);

      if (!result.success || !result.appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: result.appointment,
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/session/:sessionId
   * Get appointments by session ID
   */
  static async getBySession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
        });
      }

      const result = await AppointmentService.getBySession(sessionId);

      return res.status(200).json({
        success: true,
        data: result.appointments || [],
      });
    } catch (error) {
      console.error('Get appointments by session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * POST /api/appointments
   * Create a new appointment directly (without chatbot)
   */
  static async createAppointment(req, res) {
    try {
      const {
        ownerName,
        petName,
        petType,
        phone,
        email,
        service,
        scheduledDate,
        scheduledTimeSlot,
        reason,
        notes,
        userId,
        source,
      } = req.body;

      // Validate required fields
      if (!ownerName || !petName || !phone || !scheduledDate || !scheduledTimeSlot) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: ownerName, petName, phone, scheduledDate, scheduledTimeSlot',
        });
      }

      const result = await AppointmentService.createDirectAppointment({
        ownerName,
        petName,
        petType,
        phone,
        email,
        service,
        scheduledDate,
        scheduledTimeSlot,
        reason,
        notes,
        userId,
        source,
      });

      if (!result.success) {
        // Determine appropriate status code based on error type
        let statusCode = 400;
        if (result.slotTaken) {
          statusCode = 409; // Conflict - slot already taken
        } else if (result.duplicate) {
          statusCode = 409; // Conflict - duplicate booking
        }

        return res.status(statusCode).json({
          success: false,
          error: result.error,
          errors: result.errors || [],
          slotTaken: result.slotTaken || false,
          duplicate: result.duplicate || false,
        });
      }

      return res.status(201).json({
        success: true,
        data: result.appointment,
        message: 'Appointment created successfully',
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * PUT /api/appointments/:id
   * Update an appointment
   */
  static async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required',
        });
      }

      const result = await AppointmentService.updateAppointment(id, updateData);

      if (!result.success) {
        // Determine appropriate status code based on error type
        let statusCode = 400;
        if (result.error === 'Appointment not found') {
          statusCode = 404;
        } else if (result.slotTaken) {
          statusCode = 409; // Conflict - slot already taken
        }

        return res.status(statusCode).json({
          success: false,
          error: result.error,
          errors: result.errors || [],
          slotTaken: result.slotTaken || false,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.appointment,
        message: 'Appointment updated successfully',
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * PATCH /api/appointments/:id/status
   * Update appointment status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required',
        });
      }

      const validStatuses = Object.values(APPOINTMENT_STATUS);
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const result = await AppointmentService.updateStatus(id, status);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.appointment,
        message: `Appointment status updated to ${status}`,
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * PATCH /api/appointments/:id/cancel
   * Cancel an appointment
   */
  static async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required',
        });
      }

      const result = await AppointmentService.cancelAppointment(id, reason);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.appointment,
        message: 'Appointment cancelled successfully',
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/appointments/:id
   * Delete an appointment
   */
  static async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required',
        });
      }

      const result = await AppointmentService.deleteAppointment(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully',
      });
    } catch (error) {
      console.error('Delete appointment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/appointments/stats
   * Get appointment statistics
   */
  static async getStats(req, res) {
    try {
      const result = await AppointmentService.getStatistics();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.statistics,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

module.exports = AppointmentController;
