const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.ObjectId, ref: 'Project', required: true },
  freelancer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true, maxlength: 3000 },
  proposedBudget: { type: Number, required: true, min: 0 },
  proposedTimeline: { type: String, required: true },
  portfolioItems: [{ type: mongoose.Schema.ObjectId }],
  portfolioLinks: [String],
  screeningAnswers: [{ question: String, answer: String }],
  status: {
    type: String,
    enum: ['submitted', 'viewed', 'shortlisted', 'rejected', 'awarded', 'withdrawn'],
    default: 'submitted'
  },
  isBoosted: { type: Boolean, default: false },
  connectsUsed: { type: Number, default: 4 },
  viewedAt: Date,
  shortlistedAt: Date,
  awardedAt: Date
}, { timestamps: true });

applicationSchema.index({ project: 1, freelancer: 1 }, { unique: true });
applicationSchema.index({ freelancer: 1, status: 1 });
applicationSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
