/**
 * AI Service (Rule-Based)
 * Handles intent detection and response generation without using external AI APIs
 * Uses pattern matching, keyword detection, and state machine logic
 */

const { MESSAGES, APPOINTMENT_KEYWORDS, GREETING_KEYWORDS, FAQ_RESPONSES } = require('../config/constants');

/**
 * Intent types
 */
const INTENTS = {
  BOOK_APPOINTMENT: 'BOOK_APPOINTMENT',
  GREETING: 'GREETING',
  FAQ: 'FAQ',
  PROVIDE_DATE: 'PROVIDE_DATE',
  PROVIDE_TIME: 'PROVIDE_TIME',
  CONFIRM_YES: 'CONFIRM_YES',
  CONFIRM_NO: 'CONFIRM_NO',
  CANCEL: 'CANCEL',
  HELP: 'HELP',
  UNKNOWN: 'UNKNOWN',
};

class AIService {
  /**
   * Check if the message contains appointment booking intent
   */
  static detectAppointmentIntent(message) {
    const lowerMessage = message.toLowerCase();
    return APPOINTMENT_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Detect greeting intent
   */
  static detectGreetingIntent(message) {
    const lowerMessage = message.toLowerCase().trim();
    return GREETING_KEYWORDS.some(keyword => 
      lowerMessage === keyword || 
      lowerMessage.startsWith(keyword + ' ') ||
      lowerMessage.startsWith(keyword + '!')
    );
  }

  /**
   * Detect help/assistance intent
   */
  static detectHelpIntent(message) {
    const lowerMessage = message.toLowerCase();
    const helpKeywords = ['help', 'what can you do', 'how do i', 'assist', 'support', 'options', 'menu', 'commands'];
    return helpKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Detect cancellation intent
   */
  static detectCancelIntent(message) {
    const lowerMessage = message.toLowerCase().trim();
    const cancelKeywords = ['cancel', 'stop', 'quit', 'exit', 'nevermind', 'never mind', 'forget it', 'start over'];
    return cancelKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Detect the primary intent from a message
   */
  static detectIntent(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Check for appointment booking intent first
    if (this.detectAppointmentIntent(message)) {
      return INTENTS.BOOK_APPOINTMENT;
    }

    // Check for cancellation
    if (this.detectCancelIntent(message)) {
      return INTENTS.CANCEL;
    }

    // Check for help
    if (this.detectHelpIntent(message)) {
      return INTENTS.HELP;
    }

    // Check for greeting
    if (this.detectGreetingIntent(message)) {
      return INTENTS.GREETING;
    }

    // Check for confirmation responses
    if (/^(yes|yeah|yep|sure|ok|okay|confirm|y)$/i.test(lowerMessage)) {
      return INTENTS.CONFIRM_YES;
    }
    if (/^(no|nope|nah|cancel|n)$/i.test(lowerMessage)) {
      return INTENTS.CONFIRM_NO;
    }

    // Check for date patterns
    if (this.extractDate(message)) {
      return INTENTS.PROVIDE_DATE;
    }

    // Check for time patterns
    if (this.extractTime(message)) {
      return INTENTS.PROVIDE_TIME;
    }

    // Check for FAQ matches
    if (this.matchFAQ(message)) {
      return INTENTS.FAQ;
    }

    return INTENTS.UNKNOWN;
  }

  /**
   * Extract date from message
   */
  static extractDate(message) {
    const lowerMessage = message.toLowerCase();
    const today = new Date();

    // Check for relative dates
    if (lowerMessage.includes('today')) {
      return this.formatDate(today);
    }
    if (lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.formatDate(tomorrow);
    }

    // Check for day after tomorrow
    if (lowerMessage.includes('day after tomorrow')) {
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      return this.formatDate(dayAfter);
    }

    // Check for next week
    if (lowerMessage.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return this.formatDate(nextWeek);
    }

    // Check for day names (next Monday, this Friday, etc.)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lowerMessage.includes(days[i])) {
        const targetDay = i;
        const currentDay = today.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        return this.formatDate(targetDate);
      }
    }

    // Check for various date formats
    // Format: DD/MM or MM/DD
    const slashMatch = message.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (slashMatch) {
      const [, first, second, year] = slashMatch;
      // Assume DD/MM format
      const day = parseInt(first);
      const month = parseInt(second) - 1;
      const dateYear = year ? (year.length === 2 ? 2000 + parseInt(year) : parseInt(year)) : today.getFullYear();
      const date = new Date(dateYear, month, day);
      if (!isNaN(date.getTime())) return this.formatDate(date);
    }

    // Format: DD-MM-YYYY or YYYY-MM-DD
    const dashMatch = message.match(/\b(\d{1,4})[-.](\d{1,2})[-.](\d{1,4})\b/);
    if (dashMatch) {
      const [, first, second, third] = dashMatch;
      let date;
      if (first.length === 4) {
        // YYYY-MM-DD
        date = new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
      } else {
        // DD-MM-YYYY
        date = new Date(parseInt(third), parseInt(second) - 1, parseInt(first));
      }
      if (!isNaN(date.getTime())) return this.formatDate(date);
    }

    // Format: Month DD, YYYY (e.g., January 30, 2026)
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                        'july', 'august', 'september', 'october', 'november', 'december'];
    for (let i = 0; i < monthNames.length; i++) {
      const monthRegex = new RegExp(`${monthNames[i]}\\s+(\\d{1,2})(?:[,\\s]+(\\d{4}))?`, 'i');
      const monthMatch = message.match(monthRegex);
      if (monthMatch) {
        const day = parseInt(monthMatch[1]);
        const year = monthMatch[2] ? parseInt(monthMatch[2]) : today.getFullYear();
        const date = new Date(year, i, day);
        if (!isNaN(date.getTime())) return this.formatDate(date);
      }
    }

    // Format: DD Month YYYY (e.g., 30 January 2026)
    for (let i = 0; i < monthNames.length; i++) {
      const monthRegex = new RegExp(`(\\d{1,2})\\s+${monthNames[i]}(?:\\s+(\\d{4}))?`, 'i');
      const monthMatch = message.match(monthRegex);
      if (monthMatch) {
        const day = parseInt(monthMatch[1]);
        const year = monthMatch[2] ? parseInt(monthMatch[2]) : today.getFullYear();
        const date = new Date(year, i, day);
        if (!isNaN(date.getTime())) return this.formatDate(date);
      }
    }

    return null;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Extract time from message
   */
  static extractTime(message) {
    const lowerMessage = message.toLowerCase();

    // Check for common time expressions
    if (lowerMessage.includes('morning')) return '09:00 AM';
    if (lowerMessage.includes('noon') || lowerMessage.includes('midday')) return '12:00 PM';
    if (lowerMessage.includes('afternoon')) return '02:00 PM';
    if (lowerMessage.includes('evening')) return '05:00 PM';

    // Match time patterns like 2pm, 2:30pm, 14:30, 2 pm, 2:30 PM
    const timeMatch = message.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/);
    if (timeMatch) {
      let [, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = minutes ? parseInt(minutes) : 0;

      // Skip if this looks like a date (hours > 24)
      if (hours > 24) return null;

      // Convert to 12-hour format if needed
      if (!period) {
        // Assume AM for morning hours, PM for afternoon
        period = hours < 12 ? 'AM' : 'PM';
        if (hours > 12) hours -= 12;
      } else {
        period = period.toUpperCase();
      }

      return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    }

    return null;
  }

  /**
   * Extract date and time together from a message
   */
  static extractDateTime(message) {
    const date = this.extractDate(message);
    const time = this.extractTime(message);

    if (date && time) {
      return `${date} at ${time}`;
    }
    if (date) {
      return date;
    }
    if (time) {
      return time;
    }

    // Return the original message if no extraction possible
    return null;
  }

  /**
   * Match message against FAQ patterns
   */
  static matchFAQ(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const faq of FAQ_RESPONSES) {
      if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return faq;
      }
    }
    return null;
  }

  /**
   * Generate response based on intent and context (no AI)
   */
  static async generateResponse(userMessage, conversationHistory = []) {
    try {
      const intent = this.detectIntent(userMessage);

      switch (intent) {
        case INTENTS.BOOK_APPOINTMENT:
          return {
            success: true,
            response: MESSAGES.APPOINTMENT_START,
            isAppointmentIntent: true,
          };

        case INTENTS.GREETING:
          return {
            success: true,
            response: MESSAGES.WELCOME,
            isAppointmentIntent: false,
          };

        case INTENTS.HELP:
          return {
            success: true,
            response: MESSAGES.HELP_MESSAGE,
            isAppointmentIntent: false,
          };

        case INTENTS.CANCEL:
          return {
            success: true,
            response: MESSAGES.BOOKING_CANCELLED,
            isAppointmentIntent: false,
          };

        case INTENTS.FAQ:
          const faq = this.matchFAQ(userMessage);
          if (faq) {
            return {
              success: true,
              response: faq.response,
              isAppointmentIntent: false,
            };
          }
          break;

        default:
          // Try to match FAQ as a fallback
          const faqMatch = this.matchFAQ(userMessage);
          if (faqMatch) {
            return {
              success: true,
              response: faqMatch.response,
              isAppointmentIntent: false,
            };
          }

          return {
            success: true,
            response: MESSAGES.DEFAULT_RESPONSE,
            isAppointmentIntent: false,
          };
      }

      return {
        success: true,
        response: MESSAGES.DEFAULT_RESPONSE,
        isAppointmentIntent: false,
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
        error: error.message,
      };
    }
  }

  /**
   * Generate a simple response (for backward compatibility)
   */
  static async generateSimpleResponse(prompt) {
    return this.generateResponse(prompt);
  }
}

// Export intents for use in other modules
AIService.INTENTS = INTENTS;

module.exports = AIService;
