/**
 * Appointment Validator
 * Comprehensive validation for appointment booking
 */

const { VALIDATION, TIME_SLOTS, OPERATING_DAYS, SERVICES, PET_TYPES, APPOINTMENT_STATUS } = require('../config/constants');

/**
 * Validation error class
 */
class ValidationError extends Error {
  constructor(field, message, code = 'VALIDATION_ERROR') {
    super(message);
    this.field = field;
    this.code = code;
    this.name = 'ValidationError';
  }
}

/**
 * Collection of validation errors
 */
class ValidationErrors {
  constructor() {
    this.errors = [];
  }

  add(field, message, code = 'VALIDATION_ERROR') {
    this.errors.push({ field, message, code });
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  getErrors() {
    return this.errors;
  }

  getFirstError() {
    return this.errors[0] || null;
  }

  toResponse() {
    return {
      success: false,
      error: this.errors.length === 1 
        ? this.errors[0].message 
        : 'Multiple validation errors',
      validationErrors: this.errors,
    };
  }
}

/**
 * Validate owner name
 */
function validateOwnerName(name) {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    errors.push({ field: 'ownerName', message: 'Owner name is required', code: 'REQUIRED' });
    return errors;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    errors.push({ field: 'ownerName', message: 'Owner name cannot be empty', code: 'EMPTY' });
  } else if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    errors.push({ 
      field: 'ownerName', 
      message: `Owner name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`, 
      code: 'TOO_SHORT' 
    });
  } else if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    errors.push({ 
      field: 'ownerName', 
      message: `Owner name cannot exceed ${VALIDATION.NAME_MAX_LENGTH} characters`, 
      code: 'TOO_LONG' 
    });
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (trimmedName.length > 0 && !/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
    errors.push({ 
      field: 'ownerName', 
      message: 'Owner name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed', 
      code: 'INVALID_CHARACTERS' 
    });
  }

  return errors;
}

/**
 * Validate pet name
 */
function validatePetName(name) {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    errors.push({ field: 'petName', message: 'Pet name is required', code: 'REQUIRED' });
    return errors;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    errors.push({ field: 'petName', message: 'Pet name cannot be empty', code: 'EMPTY' });
  } else if (trimmedName.length < 1) {
    errors.push({ field: 'petName', message: 'Pet name must be at least 1 character', code: 'TOO_SHORT' });
  } else if (trimmedName.length > 50) {
    errors.push({ field: 'petName', message: 'Pet name cannot exceed 50 characters', code: 'TOO_LONG' });
  }

  return errors;
}

/**
 * Validate pet type
 */
function validatePetType(petType) {
  const errors = [];
  
  if (petType && !PET_TYPES.includes(petType)) {
    errors.push({ 
      field: 'petType', 
      message: `Invalid pet type. Must be one of: ${PET_TYPES.join(', ')}`, 
      code: 'INVALID_VALUE' 
    });
  }

  return errors;
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
  const errors = [];
  
  if (!phone || typeof phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number is required', code: 'REQUIRED' });
    return errors;
  }

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length === 0) {
    errors.push({ field: 'phone', message: 'Phone number cannot be empty', code: 'EMPTY' });
    return errors;
  }

  // Remove common separators for validation
  const cleanPhone = trimmedPhone.replace(/[\s\-\.\(\)]/g, '');

  if (cleanPhone.length < 10) {
    errors.push({ field: 'phone', message: 'Phone number is too short. Must be at least 10 digits', code: 'TOO_SHORT' });
  } else if (cleanPhone.length > 15) {
    errors.push({ field: 'phone', message: 'Phone number is too long. Cannot exceed 15 digits', code: 'TOO_LONG' });
  } else if (!/^\+?\d+$/.test(cleanPhone)) {
    errors.push({ field: 'phone', message: 'Phone number contains invalid characters. Only digits and + are allowed', code: 'INVALID_FORMAT' });
  }

  return errors;
}

/**
 * Validate email
 */
function validateEmail(email) {
  const errors = [];
  
  // Email is optional, but if provided, must be valid
  if (!email) return errors;

  if (typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string', code: 'INVALID_TYPE' });
    return errors;
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 0 && !VALIDATION.EMAIL_REGEX.test(trimmedEmail)) {
    errors.push({ field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT' });
  }

  if (trimmedEmail.length > 100) {
    errors.push({ field: 'email', message: 'Email cannot exceed 100 characters', code: 'TOO_LONG' });
  }

  return errors;
}

/**
 * Validate service type
 */
function validateService(service) {
  const errors = [];
  
  if (service) {
    const validServices = SERVICES.map(s => s.id);
    if (!validServices.includes(service)) {
      errors.push({ 
        field: 'service', 
        message: `Invalid service. Must be one of: ${validServices.join(', ')}`, 
        code: 'INVALID_VALUE' 
      });
    }
  }

  return errors;
}

/**
 * Validate scheduled date
 */
function validateScheduledDate(dateString) {
  const errors = [];
  
  if (!dateString) {
    errors.push({ field: 'scheduledDate', message: 'Scheduled date is required', code: 'REQUIRED' });
    return errors;
  }

  const date = new Date(dateString);

  // Check if valid date
  if (isNaN(date.getTime())) {
    errors.push({ field: 'scheduledDate', message: 'Invalid date format. Use YYYY-MM-DD', code: 'INVALID_FORMAT' });
    return errors;
  }

  // Set to start of day for comparison
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the past
  if (inputDate < today) {
    errors.push({ field: 'scheduledDate', message: 'Cannot book appointments for past dates', code: 'PAST_DATE' });
  }

  // Check if too far in the future (e.g., max 90 days)
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  if (inputDate > maxDate) {
    errors.push({ field: 'scheduledDate', message: 'Cannot book appointments more than 90 days in advance', code: 'TOO_FAR_FUTURE' });
  }

  // Check if it's an operating day
  const dayOfWeek = inputDate.getDay();
  if (!OPERATING_DAYS.includes(dayOfWeek)) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    errors.push({ 
      field: 'scheduledDate', 
      message: `The clinic is closed on ${dayNames[dayOfWeek]}. Please choose another day.`, 
      code: 'CLOSED_DAY' 
    });
  }

  return errors;
}

/**
 * Validate time slot
 */
function validateTimeSlot(timeSlot, scheduledDate = null) {
  const errors = [];
  
  if (!timeSlot) {
    errors.push({ field: 'scheduledTimeSlot', message: 'Time slot is required', code: 'REQUIRED' });
    return errors;
  }

  // Validate format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
    errors.push({ field: 'scheduledTimeSlot', message: 'Invalid time format. Use HH:MM (e.g., 09:00)', code: 'INVALID_FORMAT' });
    return errors;
  }

  const [hours, minutes] = timeSlot.split(':').map(Number);
  const { START_HOUR, END_HOUR, SLOT_DURATION, BREAK_START, BREAK_END } = TIME_SLOTS;

  // Check if valid hour
  if (hours < START_HOUR || hours >= END_HOUR) {
    errors.push({ 
      field: 'scheduledTimeSlot', 
      message: `Time must be between ${START_HOUR}:00 and ${END_HOUR - 1}:30. Clinic hours: 9 AM - 6 PM`, 
      code: 'OUTSIDE_HOURS' 
    });
  }

  // Check if during lunch break
  if (hours >= BREAK_START && hours < BREAK_END) {
    errors.push({ 
      field: 'scheduledTimeSlot', 
      message: 'This time slot is during lunch break (1 PM - 2 PM). Please choose another time.', 
      code: 'BREAK_TIME' 
    });
  }

  // Check if minutes align with slot duration
  if (minutes % SLOT_DURATION !== 0) {
    errors.push({ 
      field: 'scheduledTimeSlot', 
      message: `Appointments must start at ${SLOT_DURATION}-minute intervals (e.g., :00 or :30)`, 
      code: 'INVALID_INTERVAL' 
    });
  }

  // If booking for today, check if time has already passed
  if (scheduledDate) {
    const now = new Date();
    const appointmentDate = new Date(scheduledDate);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      if (hours < currentHour || (hours === currentHour && minutes <= currentMinute)) {
        errors.push({ 
          field: 'scheduledTimeSlot', 
          message: 'Cannot book appointments for a time that has already passed today', 
          code: 'TIME_PASSED' 
        });
      }

      // Also add buffer (e.g., must be at least 30 minutes from now)
      const bufferMinutes = 30;
      const appointmentMinutes = hours * 60 + minutes;
      const currentTotalMinutes = currentHour * 60 + currentMinute + bufferMinutes;
      
      if (appointmentMinutes < currentTotalMinutes) {
        errors.push({ 
          field: 'scheduledTimeSlot', 
          message: 'Appointments must be booked at least 30 minutes in advance', 
          code: 'INSUFFICIENT_NOTICE' 
        });
      }
    }
  }

  return errors;
}

/**
 * Validate preferred date/time string (for chatbot)
 */
function validatePreferredDateTime(dateTimeString) {
  const errors = [];
  
  if (!dateTimeString || typeof dateTimeString !== 'string') {
    errors.push({ field: 'preferredDateTime', message: 'Preferred date/time is required', code: 'REQUIRED' });
    return errors;
  }

  if (dateTimeString.trim().length < 5) {
    errors.push({ 
      field: 'preferredDateTime', 
      message: 'Please provide a valid date and time (e.g., "tomorrow at 2pm" or "February 5, 2026 at 10:00 AM")', 
      code: 'TOO_SHORT' 
    });
  }

  return errors;
}

/**
 * Validate status
 */
function validateStatus(status) {
  const errors = [];
  
  if (status) {
    const validStatuses = Object.values(APPOINTMENT_STATUS);
    if (!validStatuses.includes(status)) {
      errors.push({ 
        field: 'status', 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 
        code: 'INVALID_VALUE' 
      });
    }
  }

  return errors;
}

/**
 * Validate reason/notes length
 */
function validateTextFields(reason, notes) {
  const errors = [];
  
  if (reason && reason.length > 500) {
    errors.push({ field: 'reason', message: 'Reason cannot exceed 500 characters', code: 'TOO_LONG' });
  }

  if (notes && notes.length > 1000) {
    errors.push({ field: 'notes', message: 'Notes cannot exceed 1000 characters', code: 'TOO_LONG' });
  }

  return errors;
}

/**
 * Validate complete appointment data for direct booking
 */
function validateDirectAppointment(data) {
  const validationErrors = new ValidationErrors();

  // Required field checks
  const ownerNameErrors = validateOwnerName(data.ownerName);
  ownerNameErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const petNameErrors = validatePetName(data.petName);
  petNameErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const phoneErrors = validatePhone(data.phone);
  phoneErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const dateErrors = validateScheduledDate(data.scheduledDate);
  dateErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const timeErrors = validateTimeSlot(data.scheduledTimeSlot, data.scheduledDate);
  timeErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  // Optional field checks
  const petTypeErrors = validatePetType(data.petType);
  petTypeErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const emailErrors = validateEmail(data.email);
  emailErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const serviceErrors = validateService(data.service);
  serviceErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  const textErrors = validateTextFields(data.reason, data.notes);
  textErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  return validationErrors;
}

/**
 * Validate appointment update data
 */
function validateUpdateAppointment(data) {
  const validationErrors = new ValidationErrors();

  // Only validate fields that are provided
  if (data.ownerName !== undefined) {
    const errors = validateOwnerName(data.ownerName);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.petName !== undefined) {
    const errors = validatePetName(data.petName);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.phone !== undefined) {
    const errors = validatePhone(data.phone);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.scheduledDate !== undefined) {
    const errors = validateScheduledDate(data.scheduledDate);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.scheduledTimeSlot !== undefined) {
    const errors = validateTimeSlot(data.scheduledTimeSlot, data.scheduledDate);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.petType !== undefined) {
    const errors = validatePetType(data.petType);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.email !== undefined) {
    const errors = validateEmail(data.email);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.service !== undefined) {
    const errors = validateService(data.service);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  if (data.status !== undefined) {
    const errors = validateStatus(data.status);
    errors.forEach(e => validationErrors.add(e.field, e.message, e.code));
  }

  const textErrors = validateTextFields(data.reason, data.notes);
  textErrors.forEach(e => validationErrors.add(e.field, e.message, e.code));

  return validationErrors;
}

module.exports = {
  ValidationError,
  ValidationErrors,
  validateOwnerName,
  validatePetName,
  validatePetType,
  validatePhone,
  validateEmail,
  validateService,
  validateScheduledDate,
  validateTimeSlot,
  validatePreferredDateTime,
  validateStatus,
  validateTextFields,
  validateDirectAppointment,
  validateUpdateAppointment,
};
