const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 3000 },
  category: {
    type: String,
    required: true,
    enum: ['Programming & Tech', 'Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Business', 'AI Services', 'Other']
  },
  tags: [String],
  packages: {
    basic: { title: String, description: String, price: Number, deliveryDays: Number, revisions: Number, features: [String] },
    standard: { title: String, description: String, price: Number, deliveryDays: Number, revisions: Number, features: [String] },
    premium: { title: String, description: String, price: Number, deliveryDays: Number, revisions: Number, features: [String] }
  },
  gallery: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  requirements: String,
  faq: [{ question: String, answer: String }],
  status: { type: String, enum: ['active', 'paused', 'pending', 'denied'], default: 'active' },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

gigSchema.index({ seller: 1 });
gigSchema.index({ category: 1 });
gigSchema.index({ status: 1 });
gigSchema.index({ averageRating: -1 });
gigSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Gig', gigSchema);
