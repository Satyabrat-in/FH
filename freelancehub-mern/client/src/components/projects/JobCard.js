import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const JobCard = ({ job, onApply, showMatchScore }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const statusColors = {
    active: 'var(--success)', awarded: 'var(--gold)', in_progress: 'var(--info)',
    completed: 'var(--text-muted)', closed: 'var(--danger)'
  };

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 onClick={() => navigate(`/jobs/${job._id}`)} style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: 'var(--text)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--accent)'} onMouseOut={e => e.target.style.color = 'var(--text)'}>
            {job.title}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            🏢 {job.employer?.name || 'Company'} · Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
            ₹{(job.budget || 0).toLocaleString('en-IN')}{job.budgetType === 'hourly' ? '/hr' : ''}
          </div>
          {showMatchScore && job.matchScore && (
            <span style={{ fontSize: 11, background: 'rgba(0,212,170,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              🤖 {job.matchScore}% match
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {(job.skills || []).slice(0, 5).map(skill => (
          <span key={skill} className="tag">{skill}</span>
        ))}
        {(job.skills || []).length > 5 && <span className="tag">+{job.skills.length - 5}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
          <span>📋 {job.applicationCount || 0} proposals</span>
          <span>⏱ {job.estimatedDuration || 'Flexible'}</span>
          <span>📁 {job.category}</span>
        </div>
        {isAuthenticated && onApply && (
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onApply(job._id); }}>Apply Now</button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
