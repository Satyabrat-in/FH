import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast('Welcome back! 👋', 'success');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      toast(err.response?.data?.message || 'Login failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-up" style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to your FreelanceHub account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent)' }}>Forgot password?</Link>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'freelancer', companyName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      await register(form);
      toast('Account created! Welcome to FreelanceHub 🎉', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-up" style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Join FreelanceHub</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create your free account today</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[{ value: 'freelancer', icon: '💼', label: 'Freelancer', sub: 'Find work & earn' }, { value: 'employer', icon: '🏢', label: 'Client', sub: 'Post jobs & hire' }].map(opt => (
            <div key={opt.value} onClick={() => setForm(p => ({ ...p, role: opt.value }))}
              style={{ border: `1.5px solid ${form.role === opt.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: 16, cursor: 'pointer', textAlign: 'center', background: form.role === opt.value ? 'rgba(0,212,170,0.06)' : 'transparent', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.icon}</div>
              <div style={{ fontWeight: 700 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.sub}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          {form.role === 'employer' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input placeholder="Your company name" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--border-light)' }}>
          By creating an account you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
