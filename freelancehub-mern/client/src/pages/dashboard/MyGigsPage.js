import React, { useState, useEffect } from 'react';
import { gigAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = ['Programming & Tech', 'Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Music & Audio', 'Business', 'AI Services'];

const MyGigsPage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGig, setEditGig] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Programming & Tech', tags: [], packages: { basic: { title: 'Basic', description: '', price: 1000, deliveryDays: 7, revisions: 2 }, standard: { title: 'Standard', description: '', price: 3000, deliveryDays: 14, revisions: 5 }, premium: { title: 'Premium', description: '', price: 6000, deliveryDays: 21, revisions: 10 } } });
  const [tagInput, setTagInput] = useState('');
  const toast = useToast();

  const load = () => gigAPI.getMyGigs().then(r => setGigs(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.description) { toast('Title and description required', 'error'); return; }
    try {
      if (editGig) { await gigAPI.updateGig(editGig._id, form); toast('Gig updated!', 'success'); }
      else { await gigAPI.createGig(form); toast('Gig created and live! 🚀', 'success'); }
      setShowForm(false); setEditGig(null);
      setForm({ title: '', description: '', category: 'Programming & Tech', tags: [], packages: { basic: { title: 'Basic', description: '', price: 1000, deliveryDays: 7, revisions: 2 }, standard: { title: 'Standard', description: '', price: 3000, deliveryDays: 14, revisions: 5 }, premium: { title: 'Premium', description: '', price: 6000, deliveryDays: 21, revisions: 10 } } });
      load();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteGig = async (id) => {
    if (!window.confirm('Delete this gig?')) return;
    try { await gigAPI.deleteGig(id); toast('Gig deleted', 'info'); load(); } catch { toast('Failed', 'error'); }
  };

  const openEdit = (gig) => { setEditGig(gig); setForm({ title: gig.title, description: gig.description, category: gig.category, tags: gig.tags || [], packages: gig.packages || form.packages }); setShowForm(true); };
  const addTag = () => { if (!tagInput.trim() || form.tags.includes(tagInput.trim())) return; setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(''); };
  const setPkg = (pkg, field, val) => setForm(p => ({ ...p, packages: { ...p.packages, [pkg]: { ...p.packages[pkg], [field]: val } } }));

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 24, fontWeight: 800 }}>My Gigs</h2><p style={{ color: 'var(--text-muted)' }}>{gigs.length} gigs published</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditGig(null); }}>➕ Create New Gig</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>{editGig ? 'Edit Gig' : 'Create New Gig'}</h3>
          <div className="form-group"><label className="form-label">Gig Title *</label><input placeholder="I will..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label className="form-label">Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', gap: 6 }}><input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag" /><button className="btn btn-secondary btn-sm" onClick={addTag}>Add</button></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{form.tags.map(t => <span key={t} className="tag" style={{ cursor: 'pointer' }} onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))}>{t} ✕</span>)}</div>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Description *</label><textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <h4 style={{ marginBottom: 12 }}>Packages</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {['basic', 'standard', 'premium'].map(pkg => (
              <div key={pkg} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
                <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 10 }}>{pkg}</div>
                <div className="form-group"><label className="form-label" style={{ fontSize: 11 }}>Price (₹)</label><input type="number" value={form.packages[pkg].price} onChange={e => setPkg(pkg, 'price', Number(e.target.value))} /></div>
                <div className="form-group"><label className="form-label" style={{ fontSize: 11 }}>Delivery (days)</label><input type="number" value={form.packages[pkg].deliveryDays} onChange={e => setPkg(pkg, 'deliveryDays', Number(e.target.value))} /></div>
                <div className="form-group"><label className="form-label" style={{ fontSize: 11 }}>Revisions</label><input type="number" value={form.packages[pkg].revisions} onChange={e => setPkg(pkg, 'revisions', Number(e.target.value))} /></div>
                <div className="form-group"><label className="form-label" style={{ fontSize: 11 }}>Description</label><textarea rows={2} value={form.packages[pkg].description} onChange={e => setPkg(pkg, 'description', e.target.value)} /></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={save}>{editGig ? 'Update Gig' : '🚀 Publish Gig'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {gigs.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✨</div><h3>No gigs yet</h3><p>Create your first gig to start selling your services</p><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Create First Gig</button></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {gigs.map(g => (
            <div key={g._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{g.category}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                  <span>⭐ {g.averageRating?.toFixed(1) || '—'} ({g.totalReviews || 0})</span>
                  <span>📦 {g.totalOrders || 0} orders</span>
                  <span style={{ color: 'var(--accent)' }}>From ₹{(g.packages?.basic?.price || 0).toLocaleString('en-IN')}</span>
                  <span className={`badge ${g.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{g.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(g)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteGig(g._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigsPage;
