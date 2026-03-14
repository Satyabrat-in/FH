import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, isFreelancer, isEmployer, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI.getNotifications({ limit: 1 }).then(r => setUnread(r.data.unread || 0)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, animation: 'slideDown 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff' }}>FH</div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Freelance<span style={{ color: 'var(--accent)' }}>Hub</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/gigs" style={{ color: 'var(--text-muted)', fontSize: 14, padding: '6px 12px', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--text)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>Explore Gigs</Link>
          <Link to="/jobs" style={{ color: 'var(--text-muted)', fontSize: 14, padding: '6px 12px', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--text)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>Browse Jobs</Link>
          <Link to="/talent" style={{ color: 'var(--text-muted)', fontSize: 14, padding: '6px 12px', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--text)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>Find Talent</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--gold)', padding: '5px 12px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => navigate('/dashboard/connects')}>⚡ {user?.connects || 0}</span>

              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/dashboard/notifications')}>
                <span style={{ fontSize: 20 }}>🔔</span>
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread > 9 ? '9+' : unread}</span>}
              </div>

              <div style={{ position: 'relative' }}>
                <div onClick={() => setMenuOpen(!menuOpen)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', cursor: 'pointer', fontSize: 15 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 44, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', minWidth: 200, boxShadow: 'var(--shadow)', zIndex: 100 }}
                    onMouseLeave={() => setMenuOpen(false)}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.role}</div>
                    </div>
                    {[
                      { label: '📊 Dashboard', path: '/dashboard' },
                      { label: '👤 Profile', path: '/dashboard/profile' },
                      { label: '💬 Messages', path: '/dashboard/messages' },
                      { label: '⚙️ Settings', path: '/dashboard/settings' },
                    ].map(item => (
                      <div key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                        style={{ padding: '10px 16px', fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--secondary)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        {item.label}
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      <div onClick={handleLogout} style={{ padding: '10px 16px', fontSize: 14, cursor: 'pointer', color: 'var(--danger)', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--secondary)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>🚪 Sign Out</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Sign In</Link>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
