import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = ['Web Development', 'Mobile App', 'Design', 'Writing', 'Marketing', 'Data Science', 'Video', 'AI Services', 'Business', 'Other'];

const PostJobPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: 'Web Development', skills: [], budgetType: 'fixed', budget: '', estimatedDuration: '2-4 weeks', experienceLevel: 'intermediate', visibility: 'public' });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = skill => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const submit = async () => {
    if (!form.title || !form.description || !form.budget) { toast('Please fill all required fields', 'error'); return; }
    if (form.skills.length === 0) { toast('Please add at least one required skill', 'error'); return; }
    setLoading(true);
    try {
      await projectAPI.createProject({ ...form, budget: Number(form.budget) });
      toast('Job posted successfully! 🎉', 'success');
      navigate('/dashboard/my-jobs');
    } catch (err) { toast(err.response?.data?.message || 'Failed to post job', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 760 }} className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Post a Job</h2>
        <p style={{ color: 'var(--text-muted)' }}>Describe your project to attract the best freelancers</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>📋 Project Details</h3>
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input placeholder="e.g. Full Stack Developer for E-Commerce Platform" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea rows={8} placeholder="Describe your project in detail — what you need, deliverables, any specific requirements, tech stack, etc." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{form.description.length}/5000</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select value={form.experienceLevel} onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))}>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>🛠️ Required Skills</h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input placeholder="e.g. React, Node.js, MongoDB..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 1 }} />
          <button className="btn btn-secondary" onClick={addSkill}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {form.skills.map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 100, padding: '5px 12px 5px 14px', fontSize: 13 }}>
              <span style={{ color: 'var(--accent)' }}>{s}</span>
              <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          {form.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Add skills to attract qualified freelancers</p>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>💰 Budget & Timeline</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Budget Type</label>
            <select value={form.budgetType} onChange={e => setForm(p => ({ ...p, budgetType: e.target.value }))}>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget (₹) *</label>
            <input type="number" placeholder={form.budgetType === 'fixed' ? 'e.g. 50000' : 'e.g. 1500 per hour'} value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Estimated Duration</label>
            <select value={form.estimatedDuration} onChange={e => setForm(p => ({ ...p, estimatedDuration: e.target.value }))}>
              {['Less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months', 'Ongoing'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Visibility</label>
            <select value={form.visibility} onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))}>
              <option value="public">🌐 Public — Any freelancer can see</option>
              <option value="private">🔒 Private — Invite only</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading}>{loading ? 'Posting...' : '🚀 Post Job'}</button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>Cancel</button>
      </div>
    </div>
  );
};

export default PostJobPage;
