/**
 * Application Constants
 * Centralized configuration constants
 */

module.exports = {
  // Appointment booking flow states
  BOOKING_STATES: {
    IDLE: 'idle',
    COLLECTING_OWNER_NAME: 'collecting_owner_name',
    COLLECTING_PET_NAME: 'collecting_pet_name',
    COLLECTING_PHONE: 'collecting_phone',
    COLLECTING_DATE_TIME: 'collecting_date_time',
    CONFIRMING: 'confirming',
    COMPLETED: 'completed',
  },

  // Message types
  MESSAGE_TYPES: {
    USER: 'user',
    BOT: 'bot',
    SYSTEM: 'system',
  },

  // Appointment status
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  // Validation patterns
  VALIDATION: {
    PHONE_REGEX: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
  },

  // API Response messages
  MESSAGES: {
    WELCOME: "Hello! 🐾 I'm your veterinary assistant. I can help you with pet care questions or book a vet appointment. How can I help you today?",
    APPOINTMENT_START: "I'd be happy to help you book an appointment! Let me collect some information. What is the pet owner's name?",
    ASK_PET_NAME: "Great! And what is your pet's name?",
    ASK_PHONE: "Perfect! What phone number can we reach you at?",
    ASK_DATE_TIME: "Almost done! When would you like to schedule the appointment? (Please provide your preferred date and time, e.g., 'January 30, 2026 at 2:00 PM')",
    CONFIRM_BOOKING: (details) => `Please confirm your appointment details:\n\n👤 Owner: ${details.ownerName}\n🐾 Pet: ${details.petName}\n📞 Phone: ${details.phone}\n📅 Date/Time: ${details.preferredDateTime}\n\nReply "yes" to confirm or "no" to start over.`,
    BOOKING_SUCCESS: "✅ Your appointment has been booked successfully! You'll receive a confirmation soon. Is there anything else I can help you with?",
    BOOKING_CANCELLED: "No problem! The booking has been cancelled. Feel free to start over whenever you're ready. Is there anything else I can help with?",
    NON_VET_RESPONSE: "I apologize, but I can only help with veterinary and pet-related questions. Is there anything about your pet's health, care, or scheduling a vet appointment that I can assist you with?",
    ERROR_RESPONSE: "I'm sorry, I encountered an issue processing your request. Please try again or ask a different question.",
    INVALID_PHONE: "That doesn't look like a valid phone number. Please enter a valid phone number (e.g., +1234567890 or 123-456-7890).",
    INVALID_NAME: "Please enter a valid name (at least 2 characters).",
  },

  // Intent detection keywords
  APPOINTMENT_KEYWORDS: [
    'book',
    'appointment',
    'schedule',
    'visit',
    'see a vet',
    'see the vet',
    'see doctor',
    'see a doctor',
    'make an appointment',
    'book a vet',
    'vet appointment',
    'veterinary appointment',
  ],
};
