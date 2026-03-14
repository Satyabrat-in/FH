import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigAPI } from '../../services/api';
import GigCard from '../../components/gigs/GigCard';

const CATEGORIES = [
  { icon: '💻', name: 'Programming & Tech', count: '12,180' },
  { icon: '🎨', name: 'Graphics & Design', count: '8,240' },
  { icon: '📣', name: 'Digital Marketing', count: '5,900' },
  { icon: '✍️', name: 'Writing & Translation', count: '4,320' },
  { icon: '🎬', name: 'Video & Animation', count: '3,760' },
  { icon: '🎵', name: 'Music & Audio', count: '2,100' },
  { icon: '📊', name: 'Business', count: '6,450' },
  { icon: '🤖', name: 'AI Services', count: '1,830' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create Your Profile', desc: 'Showcase your skills, portfolio, experience, and get a Job Success Score badge' },
  { step: '2', title: 'Find Work or Talent', desc: 'Browse gigs & jobs with AI-matching, saved searches, and smart filters' },
  { step: '3', title: 'Collaborate Securely', desc: 'Use built-in messaging, file sharing, and a work diary' },
  { step: '4', title: 'Get Paid Safely', desc: 'Milestone-based escrow payments protect both clients and freelancers' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [featuredGigs, setFeaturedGigs] = useState([]);

  useEffect(() => {
    gigAPI.getGigs({ limit: 4 }).then(r => setFeaturedGigs(r.data.data || [])).catch(() => {});
  }, []);

  const handleSearch = () => {
    if (search) navigate(`/gigs?search=${encodeURIComponent(search)}`);
    else navigate('/gigs');
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(180deg, #0D1528 0%, #0A0F1E 100%)', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,212,170,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(124,58,237,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div className="fade-up">
          <span style={{ display: 'inline-block', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', color: 'var(--accent)', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>🇮🇳 India's #1 Smart Freelancing Platform</span>

          <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, maxWidth: 800 }}>
            Find the perfect<br />
            <span style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>freelance services</span><br />
            for your business
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 560, marginBottom: 40, lineHeight: 1.6 }}>
            Connect with world-class talent. Secure payments with escrow. AI-powered matching to find your perfect fit.
          </p>

          <div style={{ display: 'flex', gap: 0, maxWidth: 560, width: '100%', marginBottom: 20, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search for any service..." style={{ flex: 1, border: 'none', background: 'transparent', borderRadius: 0, fontSize: 15 }} />
            <button className="btn btn-primary" onClick={handleSearch} style={{ borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', paddingLeft: 24, paddingRight: 24 }}>Search</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 48 }}>
            {['Web Development', 'Logo Design', 'SEO', 'Content Writing', 'Mobile App', 'Video Editing'].map(tag => (
              <span key={tag} onClick={() => navigate(`/gigs?search=${tag}`)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 100, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['50K+', 'Freelancers'], ['₹2Cr+', 'Paid Out'], ['12K+', 'Projects Done'], ['4.9★', 'Avg Rating']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--secondary)', padding: '60px 0' }}>
        <div className="page-container">
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Popular Categories</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>Explore thousands of services across every domain</p>
          <div className="grid-4">
            {CATEGORIES.map(cat => (
              <div key={cat.name} onClick={() => navigate(`/gigs?category=${encodeURIComponent(cat.name)}`)}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.count} services</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {featuredGigs.length > 0 && (
        <div className="page-container" style={{ padding: '60px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Featured Gigs</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/gigs')}>View All →</button>
          </div>
          <div className="grid-4">
            {featuredGigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--secondary)', padding: '60px 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>How FreelanceHub Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to hire great talent or find great work</p>
          </div>
          <div className="grid-4">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 16px' }}>{item.step}</div>
                <h4 style={{ marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Get Started Free →</button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/gigs')}>Explore Gigs</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 0', borderTop: '1px solid var(--border)' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Trusted by professionals from</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, opacity: 0.4 }}>
            {['Google', 'Microsoft', 'Infosys', 'TCS', 'Flipkart', 'Zomato', 'CRED', 'Razorpay', 'PhonePe', 'Meesho'].map(c => (
              <span key={c} style={{ fontSize: 15, fontWeight: 800 }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
