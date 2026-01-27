/**
 * Appointment Controller
 * Handles appointment-related HTTP requests
 */

const { AppointmentService } = require('../services');

class AppointmentController {
  /**
   * GET /api/appointments
   * Get all appointments (Admin)
   */
  static async getAllAppointments(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const result = await AppointmentService.getAllAppointments(
        parseInt(page, 10),
        parseInt(limit, 10),
        status || null
      );

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
   * PATCH /api/appointments/:id/status
   * Update appointment status (Admin)
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

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
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
   * GET /api/appointments/stats
   * Get appointment statistics (Admin)
   */
  static async getStats(req, res) {
    try {
      const { Appointment } = require('../models');
      
      const [total, pending, confirmed, cancelled, completed] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'confirmed' }),
        Appointment.countDocuments({ status: 'cancelled' }),
        Appointment.countDocuments({ status: 'completed' }),
      ]);

      // Get today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayCount = await Appointment.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      });

      return res.status(200).json({
        success: true,
        data: {
          total,
          pending,
          confirmed,
          cancelled,
          completed,
          today: todayCount,
        },
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
