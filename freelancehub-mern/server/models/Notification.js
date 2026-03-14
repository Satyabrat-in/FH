const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['project_match', 'application_received', 'application_status', 'message', 'payment', 'review_request', 'contract', 'dispute', 'system', 'connect_low'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntityType: String,
  relatedEntityId: mongoose.Schema.ObjectId,
  actionUrl: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  expiresAt: Date
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
