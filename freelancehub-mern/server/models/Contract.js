const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.ObjectId, ref: 'Project', unique: true },
  employer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: String,
  terms: { type: String, maxlength: 5000 },
  totalAmount: { type: Number, required: true },
  budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  hourlyRate: Number,
  weeklyHourLimit: Number,
  milestones: [{
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true },
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in_progress', 'submitted', 'approved', 'revision_requested'], default: 'pending' },
    deliverables: [{ name: String, url: String }],
    submittedAt: Date,
    approvedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending_acceptance', 'active', 'paused', 'completed', 'cancelled', 'disputed'],
    default: 'pending_acceptance'
  },
  freelancerAccepted: { type: Boolean, default: false },
  employerAccepted: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  hoursLogged: { type: Number, default: 0 },
  timeEntries: [{
    date: Date,
    hours: Number,
    description: String,
    screenshots: [String]
  }]
}, { timestamps: true });

contractSchema.index({ employer: 1, status: 1 });
contractSchema.index({ freelancer: 1, status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
