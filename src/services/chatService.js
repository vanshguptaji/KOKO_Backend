/**
 * Chat Service
 * Main orchestration service for chat functionality
 */

const AIService = require('./aiService');
const ConversationService = require('./conversationService');
const AppointmentService = require('./appointmentService');
const { MESSAGES, BOOKING_STATES } = require('../config/constants');

class ChatService {
  /**
   * Process incoming chat message
   * Main entry point for handling user messages
   */
  static async processMessage(sessionId, userMessage, context = {}) {
    try {
      // 1. Get or create conversation session
      const sessionResult = await ConversationService.getOrCreateSession(sessionId, context);
      
      if (!sessionResult.success) {
        return {
          success: false,
          response: MESSAGES.ERROR_RESPONSE,
        };
      }

      const conversation = sessionResult.conversation;

      // 2. Save user message
      await ConversationService.addMessage(sessionId, 'user', userMessage);

      // 3. Check current booking state
      const bookingStateResult = await ConversationService.getBookingState(sessionId);
      const currentBookingState = bookingStateResult.state;

      // 4. If in booking flow, process booking
      if (currentBookingState.status !== BOOKING_STATES.IDLE) {
        return await this.handleBookingFlow(sessionId, userMessage, currentBookingState);
      }

      // 5. Check for appointment intent (from user message directly)
      if (AIService.detectAppointmentIntent(userMessage)) {
        return await this.startBookingFlow(sessionId);
      }

      // 6. Get conversation history for AI context
      const historyResult = await ConversationService.getHistory(sessionId, 10);
      const conversationHistory = historyResult.messages || [];

      // 7. Generate AI response
      const aiResult = await AIService.generateResponse(userMessage, conversationHistory);

      // 8. Check if AI detected appointment intent
      if (aiResult.isAppointmentIntent) {
        return await this.startBookingFlow(sessionId);
      }

      // 9. Save bot response
      await ConversationService.addMessage(sessionId, 'bot', aiResult.response);

      return {
        success: true,
        response: aiResult.response,
        sessionId,
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
        error: error.message,
      };
    }
  }

  /**
   * Start the appointment booking flow
   */
  static async startBookingFlow(sessionId) {
    try {
      const flowResult = await AppointmentService.processBookingFlow(
        sessionId,
        '',
        { status: BOOKING_STATES.IDLE, tempData: {} }
      );

      // Update booking state
      await ConversationService.updateBookingState(
        sessionId,
        flowResult.nextState,
        flowResult.tempData
      );

      // Save bot response
      await ConversationService.addMessage(sessionId, 'bot', flowResult.response);

      return {
        success: true,
        response: flowResult.response,
        sessionId,
        isBookingFlow: true,
      };
    } catch (error) {
      console.error('Error starting booking flow:', error);
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
      };
    }
  }

  /**
   * Handle ongoing booking flow
   */
  static async handleBookingFlow(sessionId, userMessage, currentState) {
    try {
      const flowResult = await AppointmentService.processBookingFlow(
        sessionId,
        userMessage,
        currentState
      );

      // If booking should be saved
      if (flowResult.shouldSave) {
        const appointmentResult = await AppointmentService.createAppointment(
          sessionId,
          flowResult.tempData
        );

        if (!appointmentResult.success) {
          await ConversationService.addMessage(
            sessionId,
            'bot',
            'There was an issue saving your appointment. Please try again.'
          );
          
          return {
            success: false,
            response: 'There was an issue saving your appointment. Please try again.',
          };
        }

        // Reset booking state (already done in createAppointment)
        await ConversationService.addMessage(sessionId, 'bot', flowResult.response);

        return {
          success: true,
          response: flowResult.response,
          sessionId,
          appointmentId: appointmentResult.appointment._id,
          isBookingComplete: true,
        };
      }

      // Update booking state
      await ConversationService.updateBookingState(
        sessionId,
        flowResult.nextState,
        flowResult.tempData
      );

      // Save bot response
      await ConversationService.addMessage(sessionId, 'bot', flowResult.response);

      return {
        success: true,
        response: flowResult.response,
        sessionId,
        isBookingFlow: flowResult.nextState !== BOOKING_STATES.IDLE,
      };
    } catch (error) {
      console.error('Error handling booking flow:', error);
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
      };
    }
  }

  /**
   * Get welcome message for new sessions
   */
  static getWelcomeMessage() {
    return MESSAGES.WELCOME;
  }

  /**
   * Initialize a new session with welcome message
   */
  static async initializeSession(sessionId, context = {}) {
    try {
      await ConversationService.getOrCreateSession(sessionId, context);
      const welcomeMessage = this.getWelcomeMessage();
      await ConversationService.addMessage(sessionId, 'bot', welcomeMessage);

      return {
        success: true,
        response: welcomeMessage,
        sessionId,
      };
    } catch (error) {
      console.error('Error initializing session:', error);
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
      };
    }
  }
}

module.exports = ChatService;
