/**
 * Validators Utility
 * Common validation functions
 */

const validator = require('validator');
const { VALIDATION } = require('../config/constants');

/**
 * Validate phone number
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');
  return VALIDATION.PHONE_REGEX.test(phone) || 
         (cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\+?\d+$/.test(cleanPhone));
};

/**
 * Validate name
 */
const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= VALIDATION.NAME_MIN_LENGTH && 
         trimmed.length <= VALIDATION.NAME_MAX_LENGTH;
};

/**
 * Validate email
 */
const isValidEmail = (email) => {
  return email && typeof email === 'string' && validator.isEmail(email);
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return validator.escape(str.trim());
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  isValidPhone,
  isValidName,
  isValidEmail,
  sanitizeString,
  isValidObjectId,
};
