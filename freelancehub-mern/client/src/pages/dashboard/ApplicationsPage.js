import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const statusBadge = { submitted: 'badge-info', viewed: 'badge-info', shortlisted: 'badge-accent', awarded: 'badge-success', rejected: 'badge-danger', withdrawn: 'badge-warning' };
const statusIcon = { submitted: '📤', viewed: '👁️', shortlisted: '⭐', awarded: '🎉', rejected: '❌', withdrawn: '↩️' };

const ApplicationsPage = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { isFreelancer } = useAuth();
  const toast = useToast();

  const load = () => applicationAPI.getMyApplications().then(r => setApps(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { if (isFreelancer) load(); else setLoading(false); }, [isFreelancer]);

  const withdraw = async (id) => {
    try { await applicationAPI.withdraw(id); toast('Application withdrawn', 'info'); load(); } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const filtered = apps.filter(a => activeTab === 'all' ? true : a.status === activeTab);

  if (!isFreelancer) return <div className="empty-state"><div className="empty-state-icon">📝</div><h3>Proposals — Freelancer Only</h3><p>Switch to a freelancer account to view proposals</p></div>;
  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 24, fontWeight: 800 }}>My Proposals</h2><p style={{ color: 'var(--text-muted)' }}>Track all your job applications</p></div>

      <div className="tab-bar">
        {[['all', 'All'], ['submitted', 'Submitted'], ['shortlisted', 'Shortlisted'], ['awarded', 'Awarded'], ['rejected', 'Rejected']].map(([val, label]) => (
          <button key={val} className={`tab-btn${activeTab === val ? ' active' : ''}`} onClick={() => setActiveTab(val)}>
            {label} ({apps.filter(a => val === 'all' ? true : a.status === val).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📝</div><h3>No proposals yet</h3><p>Browse and apply to jobs to see your proposals here</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(app => (
            <div key={app._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{app.project?.title || 'Project'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    🏢 {app.project?.employer?.name || 'Employer'} · {app.project?.category} · Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <span className={`badge ${statusBadge[app.status] || 'badge-info'}`}>{statusIcon[app.status]} {app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
              </div>

              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                <span>💰 Your Bid: <strong style={{ color: 'var(--accent)' }}>₹{(app.proposedBudget || 0).toLocaleString('en-IN')}</strong></span>
                <span>⏱ Timeline: <strong>{app.proposedTimeline}</strong></span>
                {app.isBoosted && <span>🚀 <strong style={{ color: 'var(--gold)' }}>Boosted</strong></span>}
              </div>

              {app.coverLetter && (
                <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.coverLetter}
                </div>
              )}

              {['submitted', 'viewed'].includes(app.status) && (
                <button className="btn btn-secondary btn-sm" onClick={() => withdraw(app._id)}>↩️ Withdraw</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
