/**
 * Validate Session Middleware
 * Validates session ID in requests
 */

const { v4: uuidv4, validate: uuidValidate } = require('uuid');

const validateSession = (req, res, next) => {
  let { sessionId } = req.body;
  
  // If no session ID provided, generate one
  if (!sessionId) {
    req.body.sessionId = uuidv4();
    return next();
  }

  // Validate session ID format (basic check)
  if (typeof sessionId !== 'string' || sessionId.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Invalid session ID format',
    });
  }

  next();
};

module.exports = validateSession;
