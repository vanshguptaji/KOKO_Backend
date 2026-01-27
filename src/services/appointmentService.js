/**
 * Appointment Service
 * Handles appointment booking logic and persistence
 */

const { Appointment, Conversation } = require('../models');
const { MESSAGES, BOOKING_STATES, VALIDATION, APPOINTMENT_STATUS } = require('../config/constants');
const validator = require('validator');

class AppointmentService {
  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    // Remove spaces and common separators for validation
    const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');
    return VALIDATION.PHONE_REGEX.test(phone) || 
           (cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\+?\d+$/.test(cleanPhone));
  }

  /**
   * Validate name
   */
  static isValidName(name) {
    return name && 
           name.trim().length >= VALIDATION.NAME_MIN_LENGTH && 
           name.trim().length <= VALIDATION.NAME_MAX_LENGTH;
  }

  /**
   * Process booking flow based on current state
   */
  static async processBookingFlow(sessionId, userMessage, currentState) {
    const { status, tempData } = currentState;
    const trimmedMessage = userMessage.trim();

    switch (status) {
      case BOOKING_STATES.IDLE:
        // Start booking flow
        return {
          nextState: BOOKING_STATES.COLLECTING_OWNER_NAME,
          response: MESSAGES.APPOINTMENT_START,
          tempData: {},
        };

      case BOOKING_STATES.COLLECTING_OWNER_NAME:
        if (!this.isValidName(trimmedMessage)) {
          return {
            nextState: status,
            response: MESSAGES.INVALID_NAME,
            tempData,
          };
        }
        return {
          nextState: BOOKING_STATES.COLLECTING_PET_NAME,
          response: MESSAGES.ASK_PET_NAME,
          tempData: { ...tempData, ownerName: trimmedMessage },
        };

      case BOOKING_STATES.COLLECTING_PET_NAME:
        if (!trimmedMessage || trimmedMessage.length < 1) {
          return {
            nextState: status,
            response: "Please enter your pet's name.",
            tempData,
          };
        }
        return {
          nextState: BOOKING_STATES.COLLECTING_PHONE,
          response: MESSAGES.ASK_PHONE,
          tempData: { ...tempData, petName: trimmedMessage },
        };

      case BOOKING_STATES.COLLECTING_PHONE:
        if (!this.isValidPhone(trimmedMessage)) {
          return {
            nextState: status,
            response: MESSAGES.INVALID_PHONE,
            tempData,
          };
        }
        return {
          nextState: BOOKING_STATES.COLLECTING_DATE_TIME,
          response: MESSAGES.ASK_DATE_TIME,
          tempData: { ...tempData, phone: trimmedMessage },
        };

      case BOOKING_STATES.COLLECTING_DATE_TIME:
        if (!trimmedMessage || trimmedMessage.length < 5) {
          return {
            nextState: status,
            response: "Please provide a valid date and time for your appointment.",
            tempData,
          };
        }
        const completeData = { ...tempData, preferredDateTime: trimmedMessage };
        return {
          nextState: BOOKING_STATES.CONFIRMING,
          response: MESSAGES.CONFIRM_BOOKING(completeData),
          tempData: completeData,
        };

      case BOOKING_STATES.CONFIRMING:
        const lowerMessage = trimmedMessage.toLowerCase();
        
        if (lowerMessage === 'yes' || lowerMessage === 'y' || lowerMessage === 'confirm') {
          return {
            nextState: BOOKING_STATES.COMPLETED,
            response: MESSAGES.BOOKING_SUCCESS,
            tempData,
            shouldSave: true,
          };
        } else if (lowerMessage === 'no' || lowerMessage === 'n' || lowerMessage === 'cancel') {
          return {
            nextState: BOOKING_STATES.IDLE,
            response: MESSAGES.BOOKING_CANCELLED,
            tempData: {},
          };
        } else {
          return {
            nextState: status,
            response: 'Please reply "yes" to confirm or "no" to cancel the booking.',
            tempData,
          };
        }

      default:
        return {
          nextState: BOOKING_STATES.IDLE,
          response: MESSAGES.APPOINTMENT_START,
          tempData: {},
        };
    }
  }

  /**
   * Create appointment in database
   */
  static async createAppointment(sessionId, appointmentData) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }

      const appointment = new Appointment({
        sessionId,
        conversationId: conversation._id,
        ownerName: appointmentData.ownerName,
        petName: appointmentData.petName,
        phone: appointmentData.phone,
        preferredDateTime: appointmentData.preferredDateTime,
        context: {
          userId: conversation.context?.userId,
          source: conversation.context?.source,
        },
        status: APPOINTMENT_STATUS.PENDING,
      });

      await appointment.save();

      // Reset booking state
      conversation.bookingState = {
        status: BOOKING_STATES.IDLE,
        tempData: {},
      };
      await conversation.save();

      return { success: true, appointment };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      return { success: true, appointment };
    } catch (error) {
      console.error('Error getting appointment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all appointments (for admin)
   */
  static async getAllAppointments(page = 1, limit = 20, status = null) {
    try {
      const skip = (page - 1) * limit;
      const query = status ? { status } : {};
      
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query),
      ]);

      return {
        success: true,
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting appointments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update appointment status
   */
  static async updateStatus(appointmentId, newStatus) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status: newStatus },
        { new: true }
      );

      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      return { success: true, appointment };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get appointments by session
   */
  static async getBySession(sessionId) {
    try {
      const appointments = await Appointment.find({ sessionId }).sort({ createdAt: -1 });
      return { success: true, appointments };
    } catch (error) {
      console.error('Error getting appointments by session:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AppointmentService;
