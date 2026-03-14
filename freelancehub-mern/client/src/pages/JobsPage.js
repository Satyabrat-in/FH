import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectAPI, applicationAPI } from '../../services/api';
import JobCard from '../../components/projects/JobCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks';

const CATEGORIES = ['Web Development', 'Mobile App', 'Design', 'Writing', 'Marketing', 'Data Science', 'Video', 'AI Services', 'Business', 'Other'];

const JobsPage = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applyModal, setApplyModal] = useState(null);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', proposedBudget: '', proposedTimeline: '2 weeks' });
  const [applying, setApplying] = useState(false);
  const [filters, setFilters] = useState({ search: searchParams.get('search') || '', category: '', sort: '-createdAt', budgetType: '' });
  const { isAuthenticated, isFreelancer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(filters.search);

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, search: debouncedSearch, page: p, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const r = await projectAPI.getProjects(params);
      setJobs(p === 1 ? r.data.data : prev => [...prev, ...r.data.data]);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(1); }, [debouncedSearch, filters.category, filters.sort, filters.budgetType]);

  const handleApply = (jobId) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isFreelancer) { toast('Only freelancers can apply to jobs', 'warning'); return; }
    setApplyModal(jobId);
  };

  const submitApply = async () => {
    if (!applyForm.coverLetter || !applyForm.proposedBudget) { toast('Cover letter and bid are required', 'error'); return; }
    setApplying(true);
    try {
      await applicationAPI.apply(applyModal, applyForm);
      toast('Proposal submitted! ✅', 'success');
      setApplyModal(null);
      setApplyForm({ coverLetter: '', proposedBudget: '', proposedTimeline: '2 weeks' });
    } catch (err) { toast(err.response?.data?.message || 'Failed to submit', 'error'); }
    finally { setApplying(false); }
  };

  return (
    <div className="page-container" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Browse Jobs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Find your next project from {total}+ live listings</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '2 1 240px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Search jobs, skills, or company..." style={{ paddingLeft: 36 }} />
        </div>
        <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} style={{ flex: '1 1 160px' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.sort} onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))} style={{ flex: '1 1 160px' }}>
          <option value="-createdAt">Newest First</option>
          <option value="applicationCount">Fewest Proposals</option>
          <option value="-budget">Highest Budget</option>
        </select>
        <select value={filters.budgetType} onChange={e => setFilters(p => ({ ...p, budgetType: e.target.value }))} style={{ flex: '1 1 140px' }}>
          <option value="">Any Type</option>
          <option value="fixed">Fixed Price</option>
          <option value="hourly">Hourly Rate</option>
        </select>
        <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{total} jobs</span>
      </div>

      {loading && jobs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">💼</div><h3>No jobs found</h3><p>Try different search terms or filters</p></div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(job => <JobCard key={job._id} job={job} onApply={isFreelancer ? handleApply : null} />)}
          </div>
          {page < pages && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Showing {jobs.length} of {total}</p>
              <button className="btn btn-outline" onClick={() => fetchJobs(page + 1)} disabled={loading}>{loading ? 'Loading...' : 'Load More Jobs'}</button>
            </div>
          )}
        </>
      )}

      {applyModal && (
        <div className="modal-overlay" onClick={() => setApplyModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setApplyModal(null)}>✕</button>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📝 Submit Proposal</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Write a compelling proposal to win this project</p>
            <div className="form-group">
              <label className="form-label">Cover Letter *</label>
              <textarea rows={6} placeholder="Introduce yourself, explain your approach and relevant experience..." value={applyForm.coverLetter} onChange={e => setApplyForm(p => ({ ...p, coverLetter: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Your Bid (₹) *</label>
                <input type="number" placeholder="e.g. 25000" value={applyForm.proposedBudget} onChange={e => setApplyForm(p => ({ ...p, proposedBudget: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Timeline</label>
                <select value={applyForm.proposedTimeline} onChange={e => setApplyForm(p => ({ ...p, proposedTimeline: e.target.value }))}>
                  {['1 week', '2 weeks', '3 weeks', '1 month', '2 months', '3 months'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={submitApply} disabled={applying}>{applying ? 'Submitting...' : 'Submit Proposal →'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
