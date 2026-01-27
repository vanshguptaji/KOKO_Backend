/**
 * Appointment Model
 * Stores veterinary appointment bookings
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Link to conversation
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  // Appointment details
  ownerName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  petName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  preferredDateTime: {
    type: String,
    required: true,
  },
  // Optional context from SDK
  context: {
    userId: String,
    source: String,
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  // Notes (can be added by admin)
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ phone: 1 });
appointmentSchema.index({ 'context.userId': 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Static method to get appointments by status
appointmentSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get today's appointments
appointmentSchema.statics.getTodaysAppointments = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    createdAt: { $gte: today, $lt: tomorrow },
    status: { $ne: 'cancelled' },
  }).sort({ createdAt: -1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
