/**
 * Chat Routes
 * API endpoints for chat functionality
 */

const express = require('express');
const router = express.Router();
const { ChatController } = require('../controllers');
const { validateSession } = require('../middleware');

/**
 * @route   POST /api/chat/init
 * @desc    Initialize a new chat session
 * @access  Public
 */
router.post('/init', validateSession, ChatController.initSession);

/**
 * @route   POST /api/chat/message
 * @desc    Send a message and get AI response
 * @access  Public
 */
router.post('/message', validateSession, ChatController.sendMessage);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get conversation history
 * @access  Public
 */
router.get('/history/:sessionId', ChatController.getHistory);

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Reset chat session
 * @access  Public
 */
router.delete('/session/:sessionId', ChatController.resetSession);

module.exports = router;
