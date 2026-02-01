/**
 * AI Configuration (Rule-Based Mode)
 * 
 * This file is kept for backward compatibility.
 * The chatbot now uses rule-based intent detection instead of external AI APIs.
 * No API keys are required.
 */

/**
 * Initialize AI (no-op in rule-based mode)
 */
const initializeGemini = () => {
  console.log('✅ Rule-based chatbot initialized (no AI API required)');
  return null;
};

/**
 * Get model (not used in rule-based mode)
 */
const getModel = () => {
  return null;
};

/**
 * Check if AI is available (always returns false in rule-based mode)
 */
const isGeminiAvailable = () => {
  return false;
};

module.exports = {
  initializeGemini,
  getModel,
  isGeminiAvailable,
};

