/**
 * Appointment Model
 * Stores veterinary appointment bookings
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Link to conversation (optional - for chatbot bookings)
  sessionId: {
    type: String,
    index: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
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
  petType: {
    type: String,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'],
    default: 'other',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  // Service type
  service: {
    type: String,
    enum: ['checkup', 'vaccination', 'grooming', 'dental', 'surgery', 'emergency', 'consultation', 'other'],
    default: 'checkup',
  },
  // Scheduled date and time (parsed)
  scheduledDate: {
    type: Date,
    index: true,
  },
  scheduledTimeSlot: {
    type: String, // e.g., "09:00", "10:00", etc.
  },
  // Original preferred date/time string from user
  preferredDateTime: {
    type: String,
    required: true,
  },
  // Duration in minutes
  duration: {
    type: Number,
    default: 30,
  },
  // Optional context from SDK
  context: {
    userId: String,
    source: String,
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },
  // Notes (can be added by admin)
  notes: {
    type: String,
    default: '',
  },
  // Reason for visit
  reason: {
    type: String,
    default: '',
  },
  // Reminder sent flag
  reminderSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ phone: 1 });
appointmentSchema.index({ 'context.userId': 1 });
appointmentSchema.index({ scheduledDate: 1, scheduledTimeSlot: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Virtual for formatted scheduled date
appointmentSchema.virtual('formattedScheduledDate').get(function() {
  if (!this.scheduledDate) return this.preferredDateTime;
  return this.scheduledDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Static method to get appointments by status
appointmentSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ scheduledDate: 1, scheduledTimeSlot: 1 });
};

// Static method to get today's appointments
appointmentSchema.statics.getTodaysAppointments = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $nin: ['cancelled', 'no-show'] },
  }).sort({ scheduledTimeSlot: 1 });
};

// Static method to get appointments for a specific date
appointmentSchema.statics.getByDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  return this.find({
    scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $nin: ['cancelled', 'no-show'] },
  }).sort({ scheduledTimeSlot: 1 });
};

// Static method to check if a slot is available
appointmentSchema.statics.isSlotAvailable = async function(date, timeSlot) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  const existingAppointment = await this.findOne({
    scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    scheduledTimeSlot: timeSlot,
    status: { $nin: ['cancelled', 'no-show'] },
  });
  
  return !existingAppointment;
};

// Static method to get booked slots for a date
appointmentSchema.statics.getBookedSlots = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  const appointments = await this.find({
    scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $nin: ['cancelled', 'no-show'] },
  }).select('scheduledTimeSlot');
  
  return appointments.map(apt => apt.scheduledTimeSlot);
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = function(limit = 10) {
  const now = new Date();
  return this.find({
    scheduledDate: { $gte: now },
    status: { $nin: ['cancelled', 'no-show', 'completed'] },
  })
    .sort({ scheduledDate: 1, scheduledTimeSlot: 1 })
    .limit(limit);
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
