/**
 * Conversation Service
 * Handles conversation management and persistence
 */

const { Conversation } = require('../models');
const { MESSAGES, BOOKING_STATES } = require('../config/constants');

class ConversationService {
  /**
   * Get or create a conversation session
   */
  static async getOrCreateSession(sessionId, context = {}) {
    try {
      const conversation = await Conversation.findOrCreateSession(sessionId, context);
      return { success: true, conversation };
    } catch (error) {
      console.error('Error getting/creating session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a message to conversation
   */
  static async addMessage(sessionId, role, content) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }

      await conversation.addMessage(role, content);
      return { success: true, conversation };
    } catch (error) {
      console.error('Error adding message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get conversation history
   */
  static async getHistory(sessionId, limit = 50) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return { success: true, messages: [] };
      }

      const messages = conversation.messages.slice(-limit);
      return { success: true, messages, context: conversation.context };
    } catch (error) {
      console.error('Error getting history:', error);
      return { success: false, error: error.message, messages: [] };
    }
  }

  /**
   * Get booking state for a session
   */
  static async getBookingState(sessionId) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return { 
          success: true, 
          state: { status: BOOKING_STATES.IDLE, tempData: {} } 
        };
      }

      return { 
        success: true, 
        state: conversation.bookingState,
        conversationId: conversation._id,
      };
    } catch (error) {
      console.error('Error getting booking state:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update booking state
   */
  static async updateBookingState(sessionId, status, tempData = {}) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }

      await conversation.updateBookingState(status, tempData);
      return { success: true, state: conversation.bookingState };
    } catch (error) {
      console.error('Error updating booking state:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset booking state
   */
  static async resetBookingState(sessionId) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }

      conversation.bookingState = {
        status: BOOKING_STATES.IDLE,
        tempData: {},
      };
      await conversation.save();
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting booking state:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get full conversation by session ID
   */
  static async getConversation(sessionId) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      return { success: true, conversation };
    } catch (error) {
      console.error('Error getting conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all conversations (for admin)
   */
  static async getAllConversations(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [conversations, total] = await Promise.all([
        Conversation.find()
          .sort({ lastActivityAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-messages'), // Exclude messages for list view
        Conversation.countDocuments(),
      ]);

      return {
        success: true,
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting all conversations:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ConversationService;
