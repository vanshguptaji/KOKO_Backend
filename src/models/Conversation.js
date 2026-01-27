/**
 * Conversation Model
 * Stores chat sessions and messages
 */

const mongoose = require('mongoose');

// Message sub-schema
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'bot', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Conversation schema
const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Optional SDK context
  context: {
    userId: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    petName: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: 'unknown',
    },
    customData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  // Booking flow state
  bookingState: {
    status: {
      type: String,
      enum: ['idle', 'collecting_owner_name', 'collecting_pet_name', 'collecting_phone', 'collecting_date_time', 'confirming', 'completed'],
      default: 'idle',
    },
    tempData: {
      ownerName: String,
      petName: String,
      phone: String,
      preferredDateTime: String,
    },
  },
  // Messages array
  messages: [messageSchema],
  // Metadata
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ 'context.userId': 1 });
conversationSchema.index({ lastActivityAt: -1 });

// Instance method to add a message
conversationSchema.methods.addMessage = function(role, content) {
  this.messages.push({ role, content, timestamp: new Date() });
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to update booking state
conversationSchema.methods.updateBookingState = function(status, tempData = {}) {
  this.bookingState.status = status;
  this.bookingState.tempData = { ...this.bookingState.tempData, ...tempData };
  return this.save();
};

// Static method to find or create session
conversationSchema.statics.findOrCreateSession = async function(sessionId, context = {}) {
  let conversation = await this.findOne({ sessionId });
  
  if (!conversation) {
    conversation = new this({
      sessionId,
      context: {
        userId: context.userId || null,
        userName: context.userName || null,
        petName: context.petName || null,
        source: context.source || 'unknown',
        customData: context.customData || {},
      },
    });
    await conversation.save();
  }
  
  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
