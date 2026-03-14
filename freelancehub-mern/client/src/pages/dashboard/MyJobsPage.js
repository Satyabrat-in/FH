import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, applicationAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const load = () => projectAPI.getMyProjects().then(r => setJobs(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const viewApps = async (job) => {
    setSelectedJob(job);
    try {
      const r = await applicationAPI.getProjectApplications(job._id);
      setApplications(r.data.data || []);
    } catch { setApplications([]); }
  };

  const award = async (jobId, freelancerId) => {
    try {
      await projectAPI.awardProject(jobId, freelancerId);
      toast('Project awarded! Contract created. 🎉', 'success');
      setSelectedJob(null);
      load();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const statusColor = { active: 'var(--success)', draft: 'var(--text-muted)', in_progress: 'var(--info)', completed: 'var(--accent)', closed: 'var(--danger)', awarded: 'var(--gold)' };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 24, fontWeight: 800 }}>My Job Posts</h2><p style={{ color: 'var(--text-muted)' }}>{jobs.length} projects posted</p></div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/post-job')}>➕ Post New Job</button>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No jobs posted yet</h3><p>Post your first job to start finding talent</p><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard/post-job')}>Post First Job</button></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {jobs.map(job => (
            <div key={job._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.category} · Posted {new Date(job.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>₹{(job.budget || 0).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 12, color: statusColor[job.status] || 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>{job.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {(job.skills || []).slice(0, 5).map(s => <span key={s} className="tag">{s}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📋 {job.applicationCount || 0} proposals</span>
                <button className="btn btn-primary btn-sm" onClick={() => viewApps(job)}>👥 View Proposals ({job.applicationCount || 0})</button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/post-job`)}>✏️ Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-box" style={{ maxWidth: 700, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Proposals for "{selectedJob.title}"</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{applications.length} proposal{applications.length !== 1 ? 's' : ''} received</p>
            {applications.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}><div className="empty-state-icon">📝</div><h3>No proposals yet</h3></div>
            ) : applications.map(app => (
              <div key={app._id} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {app.freelancer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{app.freelancer?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      ⭐ {app.freelancerProfile?.averageRating?.toFixed(1) || '—'} · {app.freelancerProfile?.completedJobs || 0} jobs completed
                    </div>
                  </div>
                  <div style={{ text: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{(app.proposedBudget || 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.proposedTimeline}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{app.coverLetter}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedJob.status === 'active' && <button className="btn btn-primary btn-sm" onClick={() => award(selectedJob._id, app.freelancer._id)}>🎉 Award Project</button>}
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/messages')}>💬 Message</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
