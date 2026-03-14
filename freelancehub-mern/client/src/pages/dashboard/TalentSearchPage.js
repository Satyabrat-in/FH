import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks';

const TalentSearchPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ minRate: '', maxRate: '', availability: '', level: '' });
  const toast = useToast();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search);

  const load = async () => {
    setLoading(true);
    try {
      const params = { search: debouncedSearch, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const r = await userAPI.getFreelancers(params);
      setFreelancers(r.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [debouncedSearch, filters.availability, filters.level]);

  const LEVEL_LABELS = { new: 'New', level1: 'Level 1', level2: 'Level 2', topRated: 'Top Rated ⭐', expert: 'Expert Vetted 💎' };
  const LEVEL_COLORS = { topRated: 'var(--gold)', expert: '#A78BFA', level2: 'var(--accent)', level1: 'var(--info)' };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Find Talent</h2>
        <p style={{ color: 'var(--text-muted)' }}>Browse verified freelancers and invite them to your projects</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '2 1 240px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, skill, or title..." style={{ paddingLeft: 36 }} />
        </div>
        <select value={filters.availability} onChange={e => setFilters(p => ({ ...p, availability: e.target.value }))} style={{ flex: '1 1 140px' }}>
          <option value="">Any Availability</option>
          <option value="available">Available Now</option>
          <option value="busy">Busy</option>
        </select>
        <select value={filters.level} onChange={e => setFilters(p => ({ ...p, level: e.target.value }))} style={{ flex: '1 1 140px' }}>
          <option value="">All Levels</option>
          <option value="level1">Level 1</option>
          <option value="level2">Level 2</option>
          <option value="topRated">Top Rated</option>
          <option value="expert">Expert Vetted</option>
        </select>
        <input type="number" placeholder="Min ₹/hr" value={filters.minRate} onChange={e => setFilters(p => ({ ...p, minRate: e.target.value }))} style={{ width: 90, flex: 'none' }} />
        <button className="btn btn-primary btn-sm" onClick={load}>Search</button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No freelancers found</h3><p>Try different search terms</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {freelancers.map(fl => (
            <div key={fl._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0 }}>
                  {fl.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{fl.user?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{fl.professionalTitle || 'Freelancer'}</div>
                  {fl.sellerLevel && fl.sellerLevel !== 'new' && (
                    <span style={{ fontSize: 11, color: LEVEL_COLORS[fl.sellerLevel] || 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      {LEVEL_LABELS[fl.sellerLevel]}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {(fl.skills || []).slice(0, 4).map(s => <span key={s.name} className="tag">{s.name}</span>)}
              </div>
              <div style={{ display: 'flex', justify: 'space-between', fontSize: 13, gap: 16, color: 'var(--text-muted)', marginBottom: 14 }}>
                <span>⭐ {fl.averageRating?.toFixed(1) || '—'} ({fl.totalReviews || 0})</span>
                <span>✅ {fl.completedJobs || 0} jobs</span>
                {fl.hourlyRate && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{fl.hourlyRate}/hr</span>}
                <span style={{ color: fl.availability === 'available' ? 'var(--success)' : 'var(--text-muted)' }}>● {fl.availability === 'available' ? 'Available' : 'Busy'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate('/dashboard/messages'); }}>Invite to Job</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/freelancer/${fl.user?._id}`); }}>View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentSearchPage;
