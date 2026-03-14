import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, isFreelancer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const freelancerItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/dashboard/gigs', icon: '✨', label: 'My Gigs' },
    { path: '/dashboard/find-work', icon: '💼', label: 'Find Work' },
    { path: '/dashboard/applications', icon: '📝', label: 'Proposals' },
    { path: '/dashboard/contracts', icon: '📃', label: 'Contracts' },
    { path: '/dashboard/orders', icon: '📦', label: 'Orders' },
    { path: '/dashboard/earnings', icon: '💰', label: 'Earnings' },
    { path: '/dashboard/messages', icon: '💬', label: 'Messages' },
    { path: '/dashboard/talent', icon: '🔍', label: 'Find Talent' },
    { path: '/dashboard/saved', icon: '🔖', label: 'Saved Jobs' },
    { path: '/dashboard/reviews', icon: '⭐', label: 'Reviews & JSS' },
    { path: '/dashboard/calendar', icon: '📅', label: 'Calendar' },
    { path: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
    { path: '/dashboard/skill-tests', icon: '🏆', label: 'Skill Tests' },
    { path: '/dashboard/alerts', icon: '🔔', label: 'Job Alerts' },
    { path: '/dashboard/agency', icon: '🏢', label: 'Agency' },
    { path: '/dashboard/claude-ai', icon: '🤖', label: 'Claude AI' },
    { path: '/dashboard/referral', icon: '🎁', label: 'Refer & Earn' },
    { path: '/dashboard/profile', icon: '👤', label: 'Profile' },
  ];

  const employerItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/dashboard/post-job', icon: '➕', label: 'Post a Job' },
    { path: '/dashboard/my-jobs', icon: '📋', label: 'My Jobs' },
    { path: '/dashboard/proposals', icon: '👥', label: 'Proposals' },
    { path: '/dashboard/contracts', icon: '📃', label: 'Contracts' },
    { path: '/dashboard/orders', icon: '📦', label: 'Orders' },
    { path: '/dashboard/talent', icon: '🔍', label: 'Find Talent' },
    { path: '/dashboard/messages', icon: '💬', label: 'Messages' },
    { path: '/dashboard/payments', icon: '💳', label: 'Payments' },
    { path: '/dashboard/calendar', icon: '📅', label: 'Calendar' },
    { path: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
    { path: '/dashboard/agency', icon: '🏢', label: 'Agency' },
    { path: '/dashboard/claude-ai', icon: '🤖', label: 'Claude AI' },
    { path: '/dashboard/referral', icon: '🎁', label: 'Refer & Earn' },
    { path: '/dashboard/profile', icon: '👤', label: 'Profile' },
  ];

  const items = isFreelancer ? freelancerItems : employerItems;

  return (
    <aside style={{ width: 240, flexShrink: 0, background: 'var(--card-bg)', borderRight: '1px solid var(--border)', height: 'calc(100vh - 68px)', overflowY: 'auto', position: 'sticky', top: 68, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.role === 'freelancer' ? '💼 Freelancer' : '🏢 Client'}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 8px' }}>
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--accent)' : 'var(--text-muted)', background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent', marginBottom: 2, transition: 'all 0.15s' }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--text)'; }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--text-muted)'; }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div onClick={() => { logout(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--danger)' }}>
          <span>🚪</span><span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
