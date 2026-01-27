/**
 * AI Service
 * Handles all AI-related operations using Google Gemini
 */

const { getModel, isGeminiAvailable } = require('../config/gemini');
const { MESSAGES, APPOINTMENT_KEYWORDS } = require('../config/constants');

class AIService {
  /**
   * Check if the message contains appointment booking intent
   */
  static detectAppointmentIntent(message) {
    const lowerMessage = message.toLowerCase();
    return APPOINTMENT_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Generate AI response for veterinary questions
   */
  static async generateResponse(userMessage, conversationHistory = []) {
    if (!isGeminiAvailable()) {
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
        error: 'AI service not available',
      };
    }

    try {
      const model = getModel();
      
      // Build chat history for context
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Start chat with history
      const chat = model.startChat({
        history: history.slice(-10), // Keep last 10 messages for context
      });

      // Generate response
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      // Check if AI detected appointment intent
      const hasAppointmentIntent = text.includes('[APPOINTMENT_INTENT]');
      
      // Clean up the response
      const cleanedResponse = text.replace('[APPOINTMENT_INTENT]', '').trim();

      return {
        success: true,
        response: cleanedResponse || MESSAGES.APPOINTMENT_START,
        isAppointmentIntent: hasAppointmentIntent,
      };
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Handle specific error types
      if (error.message?.includes('SAFETY')) {
        return {
          success: true,
          response: MESSAGES.NON_VET_RESPONSE,
          isAppointmentIntent: false,
        };
      }

      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
        error: error.message,
      };
    }
  }

  /**
   * Generate a simple response without conversation history
   */
  static async generateSimpleResponse(prompt) {
    if (!isGeminiAvailable()) {
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
      };
    }

    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        response: response.text(),
      };
    } catch (error) {
      console.error('Simple AI generation error:', error);
      return {
        success: false,
        response: MESSAGES.ERROR_RESPONSE,
        error: error.message,
      };
    }
  }
}

module.exports = AIService;
