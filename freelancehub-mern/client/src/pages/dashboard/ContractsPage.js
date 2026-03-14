import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { isFreelancer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const r = await contractAPI.getMyContracts();
      setContracts(r.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = contracts.filter(c => activeTab === 'all' ? true : c.status === activeTab);

  const handleAccept = async (id) => {
    try {
      await contractAPI.accept(id);
      toast('Contract accepted! Work can begin.', 'success');
      load();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const statusColor = { active: 'var(--success)', pending_acceptance: 'var(--gold)', completed: 'var(--text-muted)', disputed: 'var(--danger)', cancelled: 'var(--danger)' };
  const statusLabel = { active: '🟢 Active', pending_acceptance: '⏳ Pending', completed: '✅ Completed', disputed: '⚠️ Disputed', cancelled: '❌ Cancelled' };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Contracts</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your active and past contracts</p>
        </div>
        {!isFreelancer && <button className="btn btn-primary" onClick={() => navigate('/dashboard/post-job')}>➕ New Project</button>}
      </div>

      <div className="tab-bar">
        {[['all', 'All'], ['active', 'Active'], ['pending_acceptance', 'Pending'], ['completed', 'Completed']].map(([val, label]) => (
          <button key={val} className={`tab-btn${activeTab === val ? ' active' : ''}`} onClick={() => setActiveTab(val)}>
            {label} ({contracts.filter(c => val === 'all' ? true : c.status === val).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📃</div>
          <h3>No contracts yet</h3>
          <p>{isFreelancer ? 'Apply to jobs to get your first contract' : 'Post a job and hire a freelancer to create a contract'}</p>
        </div>
      ) : filtered.map(c => (
        <div key={c._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{c.title || c.project?.title || 'Contract'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {isFreelancer ? `🏢 ${c.employer?.name}` : `👤 ${c.freelancer?.name}`} · Started {c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN') : 'Not started'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, background: c.budgetType === 'hourly' ? 'rgba(59,130,246,0.12)' : 'rgba(0,212,170,0.1)', color: c.budgetType === 'hourly' ? 'var(--info)' : 'var(--accent)', padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>
                {c.budgetType === 'hourly' ? '⏱ Hourly' : '📌 Fixed Price'}
              </span>
              <span style={{ fontSize: 11, color: statusColor[c.status] || 'var(--text-muted)', padding: '3px 10px', borderRadius: 6, fontWeight: 700, background: 'rgba(0,0,0,0.2)' }}>
                {statusLabel[c.status] || c.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace" }}>₹{(c.totalAmount || 0).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Contract Value</div>
            </div>
            {c.milestones?.length > 0 && (
              <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>{c.milestones.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Milestones</div>
              </div>
            )}
            {c.budgetType === 'hourly' && (
              <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)' }}>{c.hoursLogged || 0}h</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hours Logged</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {c.status === 'pending_acceptance' && isFreelancer && (
              <button className="btn btn-primary btn-sm" onClick={() => handleAccept(c._id)}>✓ Accept Contract</button>
            )}
            {c.status === 'active' && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/messages`)}>💬 Message</button>
                {isFreelancer && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/contracts/${c._id}`)}>📤 Submit Work</button>}
                {!isFreelancer && <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/contracts/${c._id}`)}>👁 View Progress</button>}
              </>
            )}
            {c.status === 'completed' && (
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/contracts/${c._id}`)}>⭐ Leave Review</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractsPage;
