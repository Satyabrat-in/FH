const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, unique: true },
  professionalTitle: { type: String, maxlength: 120 },
  bio: { type: String, maxlength: 2000 },
  skills: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
    yearsExp: Number
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    description: String
  }],
  portfolio: [{
    title: String,
    description: String,
    fileUrl: String,
    thumbnailUrl: String,
    projectUrl: String,
    tags: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    credentialUrl: String
  }],
  portfolioLinks: {
    github: String,
    linkedin: String,
    dribbble: String,
    website: String
  },
  hourlyRate: { type: Number, min: 0 },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  languages: [{ name: String, proficiency: String }],
  location: { city: String, state: String, country: { type: String, default: 'India' } },
  totalEarnings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  jss: { type: Number, default: 0, min: 0, max: 100 },
  sellerLevel: { type: String, enum: ['new', 'level1', 'level2', 'topRated', 'expert'], default: 'new' },
  idVerified: { type: Boolean, default: false },
  profileCompleteness: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  savedJobs: [{ type: mongoose.Schema.ObjectId, ref: 'Project' }],
  savedSearches: [{
    name: String,
    query: String,
    category: String,
    alertEnabled: { type: Boolean, default: true }
  }]
}, { timestamps: true });

freelancerProfileSchema.methods.calcCompleteness = function() {
  let score = 0;
  if (this.professionalTitle) score += 15;
  if (this.bio && this.bio.length > 100) score += 20;
  if (this.skills && this.skills.length >= 3) score += 20;
  if (this.portfolio && this.portfolio.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.hourlyRate) score += 10;
  if (this.idVerified) score += 5;
  this.profileCompleteness = score;
  return score;
};

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
