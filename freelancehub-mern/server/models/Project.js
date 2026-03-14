const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Project title is required'], trim: true, maxlength: 200 },
  description: { type: String, required: [true, 'Project description is required'], maxlength: 5000 },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Mobile App', 'Design', 'Writing', 'Marketing', 'Data Science', 'Video', 'AI Services', 'Business', 'Other']
  },
  skills: [{ type: String, required: true }],
  budget: { type: Number, required: true, min: 0 },
  budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  budgetRange: { min: Number, max: Number },
  estimatedDuration: String,
  experienceLevel: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'intermediate' },
  status: {
    type: String,
    enum: ['draft', 'active', 'under_review', 'awarded', 'in_progress', 'submitted', 'completed', 'closed', 'cancelled'],
    default: 'active'
  },
  visibility: { type: String, enum: ['public', 'private', 'invite_only'], default: 'public' },
  attachments: [{ name: String, url: String, size: Number }],
  awardedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  awardedAt: Date,
  applicationCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  isFeatured: { type: Boolean, default: false },
  screeningQuestions: [{ question: String, required: Boolean }],
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in_progress', 'submitted', 'approved', 'revision_requested'], default: 'pending' }
  }]
}, { timestamps: true });

projectSchema.index({ employer: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Project', projectSchema);
