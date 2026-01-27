/**
 * Chat Controller
 * Handles chat-related HTTP requests
 */

const { v4: uuidv4 } = require('uuid');
const { ChatService, ConversationService } = require('../services');

class ChatController {
  /**
   * POST /api/chat/message
   * Send a message and get AI response
   */
  static async sendMessage(req, res) {
    try {
      const { message, sessionId, context } = req.body;

      // Validate message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message is required and must be a non-empty string',
        });
      }

      // Generate session ID if not provided
      const activeSessionId = sessionId || uuidv4();

      // Process the message
      const result = await ChatService.processMessage(
        activeSessionId,
        message.trim(),
        context || {}
      );

      return res.status(result.success ? 200 : 500).json({
        success: result.success,
        data: {
          response: result.response,
          sessionId: activeSessionId,
          isBookingFlow: result.isBookingFlow || false,
          isBookingComplete: result.isBookingComplete || false,
          appointmentId: result.appointmentId || null,
        },
      });
    } catch (error) {
      console.error('Chat controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * POST /api/chat/init
   * Initialize a new chat session
   */
  static async initSession(req, res) {
    try {
      const { sessionId, context } = req.body;
      
      // Generate session ID if not provided
      const activeSessionId = sessionId || uuidv4();

      // Initialize session with welcome message
      const result = await ChatService.initializeSession(activeSessionId, context || {});

      return res.status(result.success ? 200 : 500).json({
        success: result.success,
        data: {
          response: result.response,
          sessionId: activeSessionId,
        },
      });
    } catch (error) {
      console.error('Init session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/chat/history/:sessionId
   * Get conversation history for a session
   */
  static async getHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit } = req.query;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
        });
      }

      const result = await ConversationService.getHistory(
        sessionId,
        limit ? parseInt(limit, 10) : 50
      );

      return res.status(200).json({
        success: true,
        data: {
          messages: result.messages,
          context: result.context,
        },
      });
    } catch (error) {
      console.error('Get history error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/chat/session/:sessionId
   * Reset a chat session (clears booking state)
   */
  static async resetSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
        });
      }

      await ConversationService.resetBookingState(sessionId);

      return res.status(200).json({
        success: true,
        message: 'Session reset successfully',
      });
    } catch (error) {
      console.error('Reset session error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

module.exports = ChatController;
