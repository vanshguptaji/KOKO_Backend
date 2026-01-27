/**
 * Middleware Index
 * Central export for all middleware
 */

const errorHandler = require('./errorHandler');
const requestLogger = require('./requestLogger');
const validateSession = require('./validateSession');

module.exports = {
  errorHandler,
  requestLogger,
  validateSession,
};
