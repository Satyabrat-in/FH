import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ProfilePage = () => {
  const { user, profile, isFreelancer, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ professionalTitle: '', bio: '', hourlyRate: '', availability: 'available', portfolioLinks: { github: '', linkedin: '', dribbble: '', website: '' } });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (profile) {
      setForm({
        professionalTitle: profile.professionalTitle || '',
        bio: profile.bio || '',
        hourlyRate: profile.hourlyRate || '',
        availability: profile.availability || 'available',
        portfolioLinks: profile.portfolioLinks || { github: '', linkedin: '', dribbble: '', website: '' }
      });
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, skills };
      const fn = isFreelancer ? userAPI.updateFreelancerProfile : userAPI.updateEmployerProfile;
      const r = await fn(payload);
      updateProfile(r.data.data);
      toast('Profile updated successfully!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const addSkill = () => {
    if (!newSkill.trim() || skills.some(s => s.name === newSkill.trim())) return;
    setSkills(prev => [...prev, { name: newSkill.trim(), level: 'intermediate', yearsExp: 1 }]);
    setNewSkill('');
  };
  const removeSkill = (name) => setSkills(prev => prev.filter(s => s.name !== name));

  const completeness = profile?.profileCompleteness || 0;

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>My Profile</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your professional profile and settings</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
      </div>

      <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#fff', flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Profile Completeness</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{completeness}%</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user?.isVerified ? <span className="badge badge-success">✓ Email Verified</span> : <span className="badge badge-warning">Email Unverified</span>}
          {profile?.idVerified && <span className="badge badge-info">🛡️ ID Verified</span>}
        </div>
      </div>

      <div className="tab-bar">
        {[['basic', 'Basic Info'], ['skills', 'Skills'], ['links', 'Portfolio Links'], ['security', 'Security']].map(([val, label]) => (
          <button key={val} className={`tab-btn${activeTab === val ? ' active' : ''}`} onClick={() => setActiveTab(val)}>{label}</button>
        ))}
      </div>

      {activeTab === 'basic' && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">Professional Title</label>
            <input placeholder="e.g. Full Stack Developer | React & Node.js Expert" value={form.professionalTitle} onChange={e => setForm(p => ({ ...p, professionalTitle: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio / Overview</label>
            <textarea rows={6} placeholder="Describe your experience, expertise and what makes you unique..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{form.bio.length}/2000 characters</div>
          </div>
          {isFreelancer && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Hourly Rate (₹)</label>
                  <input type="number" placeholder="e.g. 1500" value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}>
                    <option value="available">✅ Available for Work</option>
                    <option value="busy">🔴 Currently Busy</option>
                    <option value="unavailable">⛔ Not Available</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Technical Skills</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input placeholder="Add a skill (e.g. React.js)" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addSkill}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 100, padding: '5px 12px 5px 14px', fontSize: 13 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.name}</span>
                <button onClick={() => removeSkill(s.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, padding: 0, lineHeight: 1, cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            {skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills added yet. Add skills to improve your profile.</p>}
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Portfolio & Social Links</h3>
          {[['github', 'GitHub', '🐙', 'https://github.com/username'], ['linkedin', 'LinkedIn', '💼', 'https://linkedin.com/in/username'], ['dribbble', 'Dribbble', '🎨', 'https://dribbble.com/username'], ['website', 'Personal Website', '🌐', 'https://yourwebsite.com']].map(([key, label, icon, ph]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{icon} {label}</label>
              <input type="url" placeholder={ph} value={form.portfolioLinks[key] || ''} onChange={e => setForm(p => ({ ...p, portfolioLinks: { ...p.portfolioLinks, [key]: e.target.value } }))} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Security Settings</h3>
          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Password</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Update your account password</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => toast('Password update form — connect to /auth/update-password', 'info')}>Change Password</button>
          </div>
          <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add extra security to your account</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => toast('2FA coming soon!', 'info')}>Enable 2FA</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
