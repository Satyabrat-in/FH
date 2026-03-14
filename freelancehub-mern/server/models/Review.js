const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.ObjectId, ref: 'Project' },
  contract: { type: mongoose.Schema.ObjectId, ref: 'Contract' },
  gig: { type: mongoose.Schema.ObjectId, ref: 'Gig' },
  reviewer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  reviewerRole: { type: String, enum: ['employer', 'freelancer'], required: true },
  ratings: {
    workQuality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    wouldRecommend: { type: Number, min: 1, max: 5 }
  },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 2000 },
  privateNote: { type: String, maxlength: 1000, select: false },
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  helpfulCount: { type: Number, default: 0 }
}, { timestamps: true });

reviewSchema.index({ reviewee: 1, isPublic: 1 });
reviewSchema.index({ project: 1 });

module.exports = mongoose.model('Review', reviewSchema);
