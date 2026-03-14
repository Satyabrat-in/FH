const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.ObjectId, ref: 'Project' },
  content: { type: String, maxlength: 5000 },
  attachments: [{ name: String, url: String, type: String, size: Number }],
  isRead: { type: Boolean, default: false },
  readAt: Date,
  deletedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  messageType: { type: String, enum: ['text', 'file', 'system', 'offer'], default: 'text' },
  offer: { amount: Number, deliveryDays: Number, description: String, status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' } }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);
