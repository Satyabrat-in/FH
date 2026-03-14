import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
  'Programming & Tech': '💻', 'Graphics & Design': '🎨', 'Digital Marketing': '📣',
  'Writing & Translation': '✍️', 'Video & Animation': '🎬', 'Music & Audio': '🎵',
  'Business': '📊', 'AI Services': '🤖', 'Other': '⭐'
};

const GigCard = ({ gig }) => {
  const navigate = useNavigate();
  const pkg = gig.packages?.basic || {};
  const icon = CATEGORY_ICONS[gig.category] || '⭐';

  return (
    <div onClick={() => navigate(`/gigs/${gig._id}`)}
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

      <div style={{ height: 140, background: `linear-gradient(135deg, ${['#0a2a4e','#1a0f2e','#0f2a1a','#2a1a0f','#0f1a2a'][gig._id?.charCodeAt(0) % 5 || 0]}, #1a2235)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, position: 'relative' }}>
        {icon}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.5)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 6 }}>{gig.category}</span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {gig.seller?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{gig.seller?.name}</span>
          {gig.sellerLevel === 'topRated' && <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>TOP</span>}
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{gig.title}</h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--gold)', fontSize: 13 }}>★</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{gig.averageRating?.toFixed(1) || '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({gig.totalReviews || 0})</span>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>From </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>₹{(pkg.price || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCard;
