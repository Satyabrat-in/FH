const FreelancerProfile = require('../models/FreelancerProfile');

const calculateMatchScore = (project, freelancerProfile) => {
  let score = 0;
  const projectSkills = (project.skills || []).map(s => s.toLowerCase());
  const freelancerSkills = (freelancerProfile.skills || []).map(s => s.name.toLowerCase());

  if (projectSkills.length === 0) return 0;

  let skillMatches = 0;
  for (const ps of projectSkills) {
    for (const fs of freelancerSkills) {
      if (fs === ps) { skillMatches += 1; break; }
      if (fs.includes(ps) || ps.includes(fs)) { skillMatches += 0.6; break; }
    }
  }
  score += (skillMatches / projectSkills.length) * 50;

  const rating = freelancerProfile.averageRating || 0;
  score += (rating / 5) * 20;

  const completedJobs = freelancerProfile.completedJobs || 0;
  score += Math.min(completedJobs / 20, 1) * 15;

  if (freelancerProfile.availability === 'available') score += 10;
  if (freelancerProfile.idVerified) score += 5;

  return Math.min(Math.round(score), 100);
};

const findMatchesForProject = async (project, limit = 10) => {
  const profiles = await FreelancerProfile.find({ isPublic: true, availability: { $ne: 'unavailable' } })
    .populate('user', 'name avatar isActive')
    .lean();

  const scored = profiles
    .filter(p => p.user && p.user.isActive)
    .map(p => ({ profile: p, score: calculateMatchScore(project, p) }))
    .filter(m => m.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};

const findMatchingProjectsForFreelancer = async (freelancerProfile, projects, limit = 10) => {
  const scored = projects
    .map(p => ({ project: p, score: calculateMatchScore(p, freelancerProfile) }))
    .filter(m => m.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};

module.exports = { calculateMatchScore, findMatchesForProject, findMatchingProjectsForFreelancer };
