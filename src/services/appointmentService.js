/**
 * Appointment Service
 * Handles appointment booking logic, availability, and persistence
 */

const { Appointment, Conversation } = require('../models');
const { MESSAGES, BOOKING_STATES, VALIDATION, APPOINTMENT_STATUS, TIME_SLOTS, OPERATING_DAYS, SERVICES } = require('../config/constants');
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
   * Validate email
   */
  static isValidEmail(email) {
    if (!email) return true; // Email is optional
    return VALIDATION.EMAIL_REGEX.test(email);
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
   * Generate available time slots for a given date
   */
  static generateTimeSlots(date) {
    const slots = [];
    const { START_HOUR, END_HOUR, SLOT_DURATION, BREAK_START, BREAK_END } = TIME_SLOTS;
    
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      // Skip lunch break
      if (hour >= BREAK_START && hour < BREAK_END) continue;
      
      for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const displayTime = this.formatTimeDisplay(hour, minute);
        slots.push({
          time: timeString,
          display: displayTime,
        });
      }
    }
    return slots;
  }

  /**
   * Format time for display (12-hour format)
   */
  static formatTimeDisplay(hour, minute) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  }

  /**
   * Check if a date is a valid operating day
   */
  static isOperatingDay(date) {
    const dayOfWeek = new Date(date).getDay();
    return OPERATING_DAYS.includes(dayOfWeek);
  }

  /**
   * Get available time slots for a specific date
   */
  static async getAvailableSlots(date) {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      // Check if it's an operating day
      if (!this.isOperatingDay(targetDate)) {
        return {
          success: true,
          date: targetDate.toISOString().split('T')[0],
          isOperatingDay: false,
          slots: [],
          message: 'The clinic is closed on this day.',
        };
      }

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        return {
          success: false,
          error: 'Cannot book appointments for past dates.',
        };
      }

      // Get all time slots
      const allSlots = this.generateTimeSlots(targetDate);
      
      // Get booked slots for this date
      const bookedSlots = await Appointment.getBookedSlots(targetDate);
      
      // Filter out booked slots
      const availableSlots = allSlots.map(slot => ({
        ...slot,
        available: !bookedSlots.includes(slot.time),
      }));

      return {
        success: true,
        date: targetDate.toISOString().split('T')[0],
        isOperatingDay: true,
        slots: availableSlots,
        totalSlots: allSlots.length,
        availableCount: availableSlots.filter(s => s.available).length,
        bookedCount: bookedSlots.length,
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get available dates for the next N days
   */
  static async getAvailableDates(days = 14) {
    try {
      const dates = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        const isOperating = this.isOperatingDay(date);
        const bookedSlots = isOperating ? await Appointment.getBookedSlots(date) : [];
        const totalSlots = isOperating ? this.generateTimeSlots(date).length : 0;
        const availableCount = totalSlots - bookedSlots.length;

        dates.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          isOperating,
          availableSlots: availableCount,
          isFull: isOperating && availableCount === 0,
        });
      }

      return { success: true, dates };
    } catch (error) {
      console.error('Error getting available dates:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get list of available services
   */
  static getServices() {
    return {
      success: true,
      services: SERVICES,
    };
  }

  /**
   * Parse date/time string to Date object and time slot
   */
  static parseDateTimeString(dateTimeString) {
    try {
      const AIService = require('./aiService');
      const date = AIService.extractDate(dateTimeString);
      const time = AIService.extractTime(dateTimeString);

      if (!date) {
        return { success: false, error: 'Could not parse date from the provided text.' };
      }

      // Parse date
      const parsedDate = new Date(date);
      parsedDate.setHours(0, 0, 0, 0);

      // Parse time to slot format
      let timeSlot = '09:00'; // Default to 9 AM
      if (time) {
        const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3]?.toUpperCase();
          
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          
          // Round to nearest slot
          const roundedMinutes = Math.round(minutes / TIME_SLOTS.SLOT_DURATION) * TIME_SLOTS.SLOT_DURATION;
          timeSlot = `${String(hours).padStart(2, '0')}:${String(roundedMinutes % 60).padStart(2, '0')}`;
        }
      }

      return {
        success: true,
        date: parsedDate,
        timeSlot,
        formatted: `${parsedDate.toISOString().split('T')[0]} at ${timeSlot}`,
      };
    } catch (error) {
      console.error('Error parsing date/time:', error);
      return { success: false, error: 'Invalid date/time format.' };
    }
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
      let conversation = null;
      
      // Get conversation if sessionId is provided
      if (sessionId) {
        conversation = await Conversation.findOne({ sessionId });
      }

      // Parse the date/time if needed
      let scheduledDate = appointmentData.scheduledDate;
      let scheduledTimeSlot = appointmentData.scheduledTimeSlot;

      if (!scheduledDate && appointmentData.preferredDateTime) {
        const parsed = this.parseDateTimeString(appointmentData.preferredDateTime);
        if (parsed.success) {
          scheduledDate = parsed.date;
          scheduledTimeSlot = parsed.timeSlot;
        }
      }

      // Check slot availability if we have a parsed date/time
      if (scheduledDate && scheduledTimeSlot) {
        const isAvailable = await Appointment.isSlotAvailable(scheduledDate, scheduledTimeSlot);
        if (!isAvailable) {
          return { 
            success: false, 
            error: 'This time slot is no longer available. Please choose another time.',
            slotTaken: true,
          };
        }
      }

      const appointment = new Appointment({
        sessionId: sessionId || null,
        conversationId: conversation?._id || null,
        ownerName: appointmentData.ownerName,
        petName: appointmentData.petName,
        petType: appointmentData.petType || 'other',
        phone: appointmentData.phone,
        email: appointmentData.email || null,
        service: appointmentData.service || 'checkup',
        scheduledDate: scheduledDate || null,
        scheduledTimeSlot: scheduledTimeSlot || null,
        preferredDateTime: appointmentData.preferredDateTime,
        duration: appointmentData.duration || 30,
        reason: appointmentData.reason || '',
        notes: appointmentData.notes || '',
        context: {
          userId: conversation?.context?.userId || appointmentData.userId,
          source: conversation?.context?.source || appointmentData.source || 'direct',
        },
        status: APPOINTMENT_STATUS.PENDING,
      });

      await appointment.save();

      // Reset booking state if conversation exists
      if (conversation) {
        conversation.bookingState = {
          status: BOOKING_STATES.IDLE,
          tempData: {},
        };
        await conversation.save();
      }

      return { success: true, appointment };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create appointment directly (without chatbot session)
   */
  static async createDirectAppointment(appointmentData) {
    try {
      const { validateDirectAppointment } = require('../utils/appointmentValidator');
      
      // Comprehensive validation
      const validationResult = validateDirectAppointment(appointmentData);
      if (validationResult.hasErrors()) {
        return validationResult.toResponse();
      }

      // Parse the date
      const scheduledDate = new Date(appointmentData.scheduledDate);
      scheduledDate.setHours(0, 0, 0, 0);

      // Additional check: Ensure date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (scheduledDate < today) {
        return { 
          success: false, 
          error: 'Cannot book appointments for past dates.',
          code: 'PAST_DATE',
        };
      }

      // Check if it's an operating day
      if (!this.isOperatingDay(scheduledDate)) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return { 
          success: false, 
          error: `The clinic is closed on ${dayNames[scheduledDate.getDay()]}. We are open Monday to Saturday.`,
          code: 'CLOSED_DAY',
        };
      }

      // Validate time slot format
      const timeSlot = appointmentData.scheduledTimeSlot;
      if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
        return {
          success: false,
          error: 'Invalid time format. Please use HH:MM format (e.g., 09:00, 14:30).',
          code: 'INVALID_TIME_FORMAT',
        };
      }

      // Parse time and validate it's within operating hours
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const { START_HOUR, END_HOUR, BREAK_START, BREAK_END, SLOT_DURATION } = TIME_SLOTS;

      if (hours < START_HOUR || hours >= END_HOUR) {
        return {
          success: false,
          error: `Appointments are only available between ${START_HOUR}:00 AM and ${END_HOUR - 12}:00 PM.`,
          code: 'OUTSIDE_HOURS',
        };
      }

      if (hours >= BREAK_START && hours < BREAK_END) {
        return {
          success: false,
          error: 'This time slot is during lunch break (1 PM - 2 PM). Please choose another time.',
          code: 'BREAK_TIME',
        };
      }

      if (minutes % SLOT_DURATION !== 0) {
        return {
          success: false,
          error: `Appointments must start at ${SLOT_DURATION}-minute intervals (e.g., :00 or :30).`,
          code: 'INVALID_INTERVAL',
        };
      }

      // If booking for today, check if the time hasn't passed
      if (scheduledDate.getTime() === today.getTime()) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const appointmentMinutes = hours * 60 + minutes;
        const bufferMinutes = 30; // Must book at least 30 min in advance

        if (appointmentMinutes <= currentMinutes + bufferMinutes) {
          return {
            success: false,
            error: 'Appointments must be booked at least 30 minutes in advance. Please choose a later time.',
            code: 'INSUFFICIENT_NOTICE',
          };
        }
      }

      // Check for overlapping/duplicate appointments (slot availability)
      const isAvailable = await Appointment.isSlotAvailable(scheduledDate, timeSlot);
      if (!isAvailable) {
        // Get the booked slots for this date to suggest alternatives
        const bookedSlots = await Appointment.getBookedSlots(scheduledDate);
        const allSlots = this.generateTimeSlots(scheduledDate);
        const availableSlots = allSlots
          .filter(s => !bookedSlots.includes(s.time))
          .slice(0, 5); // Suggest up to 5 alternatives

        return { 
          success: false, 
          error: 'This time slot is already booked. Please choose another time.',
          code: 'SLOT_TAKEN',
          slotTaken: true,
          suggestedSlots: availableSlots,
        };
      }

      // Check for duplicate appointments (same person, same day)
      const existingAppointment = await Appointment.findOne({
        phone: appointmentData.phone.trim().replace(/[\s\-\.\(\)]/g, ''),
        scheduledDate: { 
          $gte: scheduledDate, 
          $lt: new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000) 
        },
        status: { $nin: ['cancelled', 'no-show'] },
      });

      if (existingAppointment) {
        return {
          success: false,
          error: 'You already have an appointment scheduled for this date. Please choose a different date or cancel your existing appointment first.',
          code: 'DUPLICATE_BOOKING',
          existingAppointment: {
            id: existingAppointment._id,
            time: existingAppointment.scheduledTimeSlot,
            service: existingAppointment.service,
          },
        };
      }

      // Get service duration
      const service = SERVICES.find(s => s.id === appointmentData.service) || SERVICES[0];

      const appointment = new Appointment({
        ownerName: appointmentData.ownerName.trim(),
        petName: appointmentData.petName.trim(),
        petType: appointmentData.petType || 'other',
        phone: appointmentData.phone.trim(),
        email: appointmentData.email?.trim() || null,
        service: appointmentData.service || 'checkup',
        scheduledDate,
        scheduledTimeSlot: timeSlot,
        preferredDateTime: `${scheduledDate.toISOString().split('T')[0]} at ${timeSlot}`,
        duration: service.duration,
        reason: appointmentData.reason?.trim() || '',
        notes: appointmentData.notes?.trim() || '',
        context: {
          userId: appointmentData.userId,
          source: appointmentData.source || 'api',
        },
        status: APPOINTMENT_STATUS.PENDING,
      });

      await appointment.save();
      return { 
        success: true, 
        appointment,
        message: 'Appointment booked successfully!',
      };
    } catch (error) {
      console.error('Error creating direct appointment:', error);
      
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        return {
          success: false,
          error: 'A duplicate appointment entry was detected. Please try again.',
          code: 'DUPLICATE_ENTRY',
        };
      }

      // Handle validation errors from Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return {
          success: false,
          error: messages.join('. '),
          code: 'MONGOOSE_VALIDATION',
        };
      }

      return { 
        success: false, 
        error: 'An unexpected error occurred while booking your appointment. Please try again.',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(appointmentId, updateData) {
    try {
      const { validateUpdateAppointment } = require('../utils/appointmentValidator');

      // Validate appointment ID format
      if (!appointmentId || typeof appointmentId !== 'string') {
        return { 
          success: false, 
          error: 'Valid appointment ID is required.',
          code: 'INVALID_ID',
        };
      }

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
        return {
          success: false,
          error: 'Invalid appointment ID format.',
          code: 'INVALID_ID_FORMAT',
        };
      }

      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return { 
          success: false, 
          error: 'Appointment not found. It may have been deleted.',
          code: 'NOT_FOUND',
        };
      }

      // Check if appointment is already completed or cancelled
      if (appointment.status === 'completed' && !updateData.notes) {
        return {
          success: false,
          error: 'Cannot modify a completed appointment. Only notes can be updated.',
          code: 'ALREADY_COMPLETED',
        };
      }

      // Validate update data
      const validationResult = validateUpdateAppointment(updateData);
      if (validationResult.hasErrors()) {
        return validationResult.toResponse();
      }

      // If changing date/time, perform additional checks
      if (updateData.scheduledDate || updateData.scheduledTimeSlot) {
        const newDate = updateData.scheduledDate 
          ? new Date(updateData.scheduledDate) 
          : appointment.scheduledDate;
        const newTimeSlot = updateData.scheduledTimeSlot || appointment.scheduledTimeSlot;
        
        if (newDate) {
          newDate.setHours(0, 0, 0, 0);
        }

        // Check if date or time actually changed
        const currentDate = appointment.scheduledDate ? new Date(appointment.scheduledDate) : null;
        if (currentDate) currentDate.setHours(0, 0, 0, 0);
        
        const dateChanged = !currentDate || !newDate || 
          currentDate.getTime() !== newDate.getTime();
        const timeChanged = newTimeSlot !== appointment.scheduledTimeSlot;
        
        if (dateChanged || timeChanged) {
          // Check if new date is not in the past
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (newDate && newDate < today) {
            return {
              success: false,
              error: 'Cannot reschedule to a past date.',
              code: 'PAST_DATE',
            };
          }

          // Check if operating day
          if (newDate && !this.isOperatingDay(newDate)) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return { 
              success: false, 
              error: `The clinic is closed on ${dayNames[newDate.getDay()]}. We are open Monday to Saturday.`,
              code: 'CLOSED_DAY',
            };
          }

          // Validate time slot format and hours
          if (newTimeSlot) {
            if (!/^\d{2}:\d{2}$/.test(newTimeSlot)) {
              return {
                success: false,
                error: 'Invalid time format. Please use HH:MM format (e.g., 09:00, 14:30).',
                code: 'INVALID_TIME_FORMAT',
              };
            }

            const [hours, minutes] = newTimeSlot.split(':').map(Number);
            const { START_HOUR, END_HOUR, BREAK_START, BREAK_END, SLOT_DURATION } = TIME_SLOTS;

            if (hours < START_HOUR || hours >= END_HOUR) {
              return {
                success: false,
                error: `Appointments are only available between ${START_HOUR}:00 AM and ${END_HOUR - 12}:00 PM.`,
                code: 'OUTSIDE_HOURS',
              };
            }

            if (hours >= BREAK_START && hours < BREAK_END) {
              return {
                success: false,
                error: 'This time slot is during lunch break (1 PM - 2 PM). Please choose another time.',
                code: 'BREAK_TIME',
              };
            }

            if (minutes % SLOT_DURATION !== 0) {
              return {
                success: false,
                error: `Appointments must start at ${SLOT_DURATION}-minute intervals (e.g., :00 or :30).`,
                code: 'INVALID_INTERVAL',
              };
            }

            // Check for same-day past time
            if (newDate && newDate.getTime() === today.getTime()) {
              const now = new Date();
              const currentMinutes = now.getHours() * 60 + now.getMinutes();
              const appointmentMinutes = hours * 60 + minutes;
              
              if (appointmentMinutes <= currentMinutes) {
                return {
                  success: false,
                  error: 'Cannot reschedule to a time that has already passed today.',
                  code: 'TIME_PASSED',
                };
              }
            }
          }
          
          // Check for slot availability (excluding current appointment)
          if (newDate && newTimeSlot) {
            const existingAppointments = await Appointment.find({
              scheduledDate: { 
                $gte: newDate, 
                $lt: new Date(newDate.getTime() + 24 * 60 * 60 * 1000) 
              },
              scheduledTimeSlot: newTimeSlot,
              status: { $nin: ['cancelled', 'no-show'] },
              _id: { $ne: appointmentId },
            });
            
            if (existingAppointments.length > 0) {
              // Get available alternatives
              const bookedSlots = await Appointment.getBookedSlots(newDate);
              const allSlots = this.generateTimeSlots(newDate);
              const availableSlots = allSlots
                .filter(s => !bookedSlots.includes(s.time) || s.time === appointment.scheduledTimeSlot)
                .slice(0, 5);

              return { 
                success: false, 
                error: 'This time slot is already booked by another appointment.',
                code: 'SLOT_TAKEN',
                slotTaken: true,
                suggestedSlots: availableSlots,
              };
            }
          }

          // Update the date/time fields
          if (updateData.scheduledDate) {
            updateData.scheduledDate = newDate;
          }
        }
      }

      // Update allowed fields
      const allowedFields = [
        'ownerName', 'petName', 'petType', 'phone', 'email',
        'service', 'scheduledDate', 'scheduledTimeSlot', 'preferredDateTime',
        'duration', 'reason', 'notes', 'status'
      ];

      const updatedFields = [];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          // Trim string fields
          if (typeof updateData[field] === 'string') {
            appointment[field] = updateData[field].trim();
          } else {
            appointment[field] = updateData[field];
          }
          updatedFields.push(field);
        }
      });

      // Update preferredDateTime if date/time changed
      if (updateData.scheduledDate || updateData.scheduledTimeSlot) {
        if (appointment.scheduledDate && appointment.scheduledTimeSlot) {
          appointment.preferredDateTime = `${appointment.scheduledDate.toISOString().split('T')[0]} at ${appointment.scheduledTimeSlot}`;
        }
      }

      await appointment.save();
      return { 
        success: true, 
        appointment,
        message: 'Appointment updated successfully.',
        updatedFields,
      };
    } catch (error) {
      console.error('Error updating appointment:', error);

      // Handle cast errors (invalid ObjectId)
      if (error.name === 'CastError') {
        return {
          success: false,
          error: 'Invalid appointment ID format.',
          code: 'INVALID_ID',
        };
      }

      // Handle validation errors from Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return {
          success: false,
          error: messages.join('. '),
          code: 'MONGOOSE_VALIDATION',
        };
      }

      return { 
        success: false, 
        error: 'An unexpected error occurred while updating the appointment.',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(appointmentId, reason = '') {
    try {
      // Validate appointment ID
      if (!appointmentId || !/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
        return {
          success: false,
          error: 'Invalid appointment ID.',
          code: 'INVALID_ID',
        };
      }

      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return { 
          success: false, 
          error: 'Appointment not found.',
          code: 'NOT_FOUND',
        };
      }

      if (appointment.status === 'cancelled') {
        return { 
          success: false, 
          error: 'This appointment has already been cancelled.',
          code: 'ALREADY_CANCELLED',
        };
      }

      if (appointment.status === 'completed') {
        return {
          success: false,
          error: 'Cannot cancel a completed appointment.',
          code: 'ALREADY_COMPLETED',
        };
      }

      // Check if trying to cancel a past appointment
      if (appointment.scheduledDate) {
        const appointmentDate = new Date(appointment.scheduledDate);
        appointmentDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
          return {
            success: false,
            error: 'Cannot cancel a past appointment. Please mark it as completed or no-show instead.',
            code: 'PAST_APPOINTMENT',
          };
        }
      }

      appointment.status = 'cancelled';
      if (reason && typeof reason === 'string' && reason.trim()) {
        const trimmedReason = reason.trim();
        if (trimmedReason.length > 500) {
          return {
            success: false,
            error: 'Cancellation reason cannot exceed 500 characters.',
            code: 'REASON_TOO_LONG',
          };
        }
        appointment.notes = appointment.notes 
          ? `${appointment.notes}\nCancellation reason: ${trimmedReason}`
          : `Cancellation reason: ${trimmedReason}`;
      }

      await appointment.save();
      return { 
        success: true, 
        appointment,
        message: 'Appointment cancelled successfully.',
      };
    } catch (error) {
      console.error('Error cancelling appointment:', error);

      if (error.name === 'CastError') {
        return {
          success: false,
          error: 'Invalid appointment ID format.',
          code: 'INVALID_ID',
        };
      }

      return { 
        success: false, 
        error: 'An unexpected error occurred while cancelling the appointment.',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Delete appointment (hard delete)
   */
  static async deleteAppointment(appointmentId) {
    try {
      // Validate appointment ID
      if (!appointmentId || !/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
        return {
          success: false,
          error: 'Invalid appointment ID.',
          code: 'INVALID_ID',
        };
      }

      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return { 
          success: false, 
          error: 'Appointment not found.',
          code: 'NOT_FOUND',
        };
      }

      // Optionally prevent deletion of non-cancelled appointments
      if (appointment.status !== 'cancelled' && appointment.status !== 'completed' && appointment.status !== 'no-show') {
        return {
          success: false,
          error: 'Only cancelled, completed, or no-show appointments can be deleted. Please cancel the appointment first.',
          code: 'CANNOT_DELETE_ACTIVE',
        };
      }

      await Appointment.findByIdAndDelete(appointmentId);

      return { 
        success: true, 
        message: 'Appointment deleted permanently.',
        deletedAppointment: {
          id: appointment._id,
          ownerName: appointment.ownerName,
          petName: appointment.petName,
          scheduledDate: appointment.scheduledDate,
        },
      };
    } catch (error) {
      console.error('Error deleting appointment:', error);

      if (error.name === 'CastError') {
        return {
          success: false,
          error: 'Invalid appointment ID format.',
          code: 'INVALID_ID',
        };
      }

      return { 
        success: false, 
        error: 'An unexpected error occurred while deleting the appointment.',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }
      return { success: true, appointment };
    } catch (error) {
      console.error('Error getting appointment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all appointments with filters
   */
  static async getAllAppointments(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        date = null,
        startDate = null,
        endDate = null,
        search = null,
        sortBy = 'scheduledDate',
        sortOrder = 'asc',
      } = options;

      const skip = (page - 1) * limit;
      const query = {};

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by specific date
      if (date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.scheduledDate = { $gte: targetDate, $lt: nextDay };
      }

      // Filter by date range
      if (startDate || endDate) {
        query.scheduledDate = {};
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          query.scheduledDate.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.scheduledDate.$lte = end;
        }
      }

      // Search by name, phone, or pet name
      if (search) {
        query.$or = [
          { ownerName: { $regex: search, $options: 'i' } },
          { petName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'scheduledDate') {
        sort.scheduledTimeSlot = sortOrder === 'desc' ? -1 : 1;
      }

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .sort(sort)
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
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      console.error('Error getting appointments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get today's appointments
   */
  static async getTodaysAppointments() {
    try {
      const appointments = await Appointment.getTodaysAppointments();
      return { success: true, appointments };
    } catch (error) {
      console.error('Error getting today\'s appointments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcomingAppointments(limit = 10) {
    try {
      const appointments = await Appointment.getUpcoming(limit);
      return { success: true, appointments };
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get appointments by date
   */
  static async getAppointmentsByDate(date) {
    try {
      const appointments = await Appointment.getByDate(date);
      return { success: true, appointments };
    } catch (error) {
      console.error('Error getting appointments by date:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update appointment status
   */
  static async updateStatus(appointmentId, newStatus) {
    try {
      const validStatuses = Object.values(APPOINTMENT_STATUS);
      if (!validStatuses.includes(newStatus)) {
        return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
      }

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
      const appointments = await Appointment.find({ sessionId })
        .sort({ scheduledDate: -1, scheduledTimeSlot: -1 });
      return { success: true, appointments };
    } catch (error) {
      console.error('Error getting appointments by session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get appointment statistics
   */
  static async getStatistics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const [
        total,
        pending,
        confirmed,
        cancelled,
        completed,
        noShow,
        todayCount,
        thisWeekCount,
        thisMonthCount,
        upcomingAppointments,
      ] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'confirmed' }),
        Appointment.countDocuments({ status: 'cancelled' }),
        Appointment.countDocuments({ status: 'completed' }),
        Appointment.countDocuments({ status: 'no-show' }),
        Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow } }),
        Appointment.countDocuments({ scheduledDate: { $gte: thisWeekStart, $lt: thisWeekEnd } }),
        Appointment.countDocuments({ scheduledDate: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
        Appointment.getUpcoming(5),
      ]);

      // Get service breakdown
      const serviceBreakdown = await Appointment.aggregate([
        { $match: { status: { $nin: ['cancelled', 'no-show'] } } },
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      return {
        success: true,
        statistics: {
          total,
          byStatus: {
            pending,
            confirmed,
            cancelled,
            completed,
            noShow,
          },
          today: todayCount,
          thisWeek: thisWeekCount,
          thisMonth: thisMonthCount,
          serviceBreakdown: serviceBreakdown.map(s => ({
            service: s._id,
            count: s.count,
          })),
          upcomingAppointments,
        },
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AppointmentService;
