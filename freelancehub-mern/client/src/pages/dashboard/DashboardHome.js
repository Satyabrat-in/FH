import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, projectAPI } from '../../services/api';

const DashboardHome = () => {
  const { user, isFreelancer } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await userAPI.getDashboardStats();
        setStats(statsRes.data.stats);
        if (isFreelancer) {
          const recRes = await projectAPI.getRecommendedProjects();
          setRecommended(recRes.data.data || []);
        }
      } catch {}
      finally { setLoading(false); }
    };
    loadData();
  }, [isFreelancer]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  const freelancerStats = [
    { label: 'Completed Jobs', value: stats?.completedJobs || 0, icon: '✅' },
    { label: 'Total Earned', value: `₹${(stats?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: '💰', mono: true },
    { label: 'Avg Rating', value: stats?.averageRating ? stats.averageRating.toFixed(1) + ' ★' : '—', icon: '⭐' },
    { label: 'JSS Score', value: `${stats?.jss || 0}%`, icon: '📊', mono: true },
    { label: 'Active Contracts', value: stats?.activeContracts || 0, icon: '📃' },
    { label: 'Connects', value: user?.connects || 0, icon: '⚡' },
    { label: 'Applications', value: stats?.totalApplications || 0, icon: '📝' },
    { label: 'Profile Score', value: `${stats?.profileCompleteness || 0}%`, icon: '👤' },
  ];

  const employerStats = [
    { label: 'Jobs Posted', value: stats?.projectsPosted || 0, icon: '📋' },
    { label: 'Active Contracts', value: stats?.activeContracts || 0, icon: '📃' },
    { label: 'Completed', value: stats?.completedProjects || 0, icon: '✅' },
    { label: 'Total Spent', value: `₹${(stats?.totalSpent || 0).toLocaleString('en-IN')}`, icon: '💰', mono: true },
  ];

  const displayStats = isFreelancer ? freelancerStats : employerStats;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>Welcome back, {user?.name}! 👋</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          {isFreelancer ? "Here's your freelancing overview" : "Manage your projects and team"}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        {displayStats.map(s => (
          <div key={s.label} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: s.mono ? "'JetBrains Mono',monospace" : 'inherit' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {isFreelancer && stats?.profileCompleteness < 80 && (
        <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div style={{ flex: 1 }}>
            <strong>Complete your profile</strong>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Your profile is {stats?.profileCompleteness || 0}% complete. A complete profile gets 3x more views.</p>
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => navigate('/dashboard/profile')}>Update Profile</button>
        </div>
      )}

      {isFreelancer && recommended.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>🤖 AI-Matched Jobs For You</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard/find-work')}>View All →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommended.slice(0, 4).map(job => (
              <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>🏢 {job.employer?.name} · {job.category}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>₹{(job.budget || 0).toLocaleString('en-IN')}</span>
                    {job.matchScore && <span style={{ fontSize: 11, background: 'rgba(0,212,170,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>🤖 {job.matchScore}% match</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(job.skills || []).slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isFreelancer && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard/post-job')}>➕ Post a New Job</button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard/talent')}>🔍 Find Talent</button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard/contracts')}>📃 View Contracts</button>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
