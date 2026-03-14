import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gigAPI } from '../../services/api';
import GigCard from '../../components/gigs/GigCard';
import { useDebounce } from '../../hooks';

const CATEGORIES = ['Programming & Tech', 'Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Business', 'AI Services'];
const LEVELS = [{ value: 'new', label: 'New Seller' }, { value: 'level1', label: 'Level 1' }, { value: 'level2', label: 'Level 2' }, { value: 'topRated', label: 'Top Rated' }];

const GigsPage = () => {
  const [searchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: searchParams.get('search') || '', category: searchParams.get('category') || '', sort: '-averageRating', minPrice: '', maxPrice: '', delivery: '', level: '' });

  const debouncedSearch = useDebounce(filters.search);

  const fetchGigs = async (p = 1, reset = true) => {
    setLoading(true);
    try {
      const params = { ...filters, search: debouncedSearch, page: p, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const r = await gigAPI.getGigs(params);
      setGigs(p === 1 ? r.data.data : prev => [...prev, ...r.data.data]);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGigs(1); }, [debouncedSearch, filters.category, filters.sort, filters.minPrice, filters.maxPrice, filters.delivery, filters.level]);

  const updateFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }));

  return (
    <div className="page-container" style={{ padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Explore Gigs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Discover services from top freelancers across India</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '2 1 240px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input value={filters.search} onChange={e => updateFilter('search', e.target.value)} placeholder="Search gigs, skills, or sellers..." style={{ paddingLeft: 36 }} />
        </div>
        <select value={filters.category} onChange={e => updateFilter('category', e.target.value)} style={{ flex: '1 1 180px' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} style={{ flex: '1 1 160px' }}>
          <option value="-averageRating">Best Match</option>
          <option value="-totalReviews">Most Reviews</option>
          <option value="packages.basic.price">Price: Low→High</option>
          <option value="-packages.basic.price">Price: High→Low</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filters.level} onChange={e => updateFilter('level', e.target.value)} style={{ flex: '1 1 140px' }}>
          <option value="">All Levels</option>
          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <select value={filters.delivery} onChange={e => updateFilter('delivery', e.target.value)} style={{ flex: '1 1 140px' }}>
          <option value="">Any Delivery</option>
          <option value="1">Express (1 day)</option>
          <option value="3">Up to 3 days</option>
          <option value="7">Up to 7 days</option>
        </select>
        <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} style={{ width: 90, flex: 'none' }} />
        <span style={{ color: 'var(--text-muted)' }}>–</span>
        <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} style={{ width: 90, flex: 'none' }} />
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{total} services</span>
      </div>

      {loading && gigs.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : gigs.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No gigs found</h3><p>Try adjusting your filters</p></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {gigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
          </div>
          {page < pages && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Showing {gigs.length} of {total}</p>
              <button className="btn btn-outline" onClick={() => fetchGigs(page + 1, false)} disabled={loading}>{loading ? 'Loading...' : 'Load More Services'}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GigsPage;
