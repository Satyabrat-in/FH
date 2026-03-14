import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const EarningsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'bank_transfer' });

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, histRes] = await Promise.all([paymentAPI.getEarningsSummary(), paymentAPI.getPaymentHistory()]);
        setSummary(sumRes.data.data);
        setHistory(histRes.data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const FEE_TIERS = [['First ₹50,000', '20%', 'New client'], ['₹50K – ₹5L', '10%', 'Growing relationship'], ['Above ₹5L', '5%', 'Long-term partner']];

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Earnings & Payments</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your complete financial overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => setWithdrawModal(true)}>💳 Withdraw Funds</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Available Balance', value: `₹${(user?.totalEarned || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'var(--accent)' },
          { label: 'In Escrow', value: `₹${(summary?.inEscrow || 0).toLocaleString('en-IN')}`, icon: '🔒', color: 'var(--gold)' },
          { label: 'Lifetime Earned', value: `₹${(summary?.totalEarned || 0).toLocaleString('en-IN')}`, icon: '📈', color: 'var(--success)' },
          { label: 'Connects', value: user?.connects || 0, icon: '⚡', color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Service Fee Structure</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>FreelanceHub uses a tiered fee based on lifetime earnings with each client</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {FEE_TIERS.map(([tier, fee, desc]) => (
            <div key={tier} style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{tier}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace" }}>{fee}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{desc}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>💡 Direct Contracts have 0% fee</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Transaction History</h3>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : history.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">💰</div><h3>No transactions yet</h3><p>Complete your first order to see transactions here</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Date', 'Type', 'Project', 'Amount', 'Fee', 'Net', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{p.type.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{p.project?.title?.substring(0, 30) || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--danger)' }}>-₹{p.platformFee?.toLocaleString('en-IN') || 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>₹{p.netAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${p.escrowStatus === 'released' ? 'badge-success' : p.escrowStatus === 'deposited' ? 'badge-warning' : 'badge-info'}`}>{p.escrowStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {withdrawModal && (
        <div className="modal-overlay" onClick={() => setWithdrawModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setWithdrawModal(false)}>✕</button>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>💳 Withdraw Funds</h2>
            <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Available Balance</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace" }}>₹{(user?.totalEarned || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Amount to Withdraw (₹)</label>
              <input type="number" placeholder="Minimum ₹1,000" value={withdrawForm.amount} onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select value={withdrawForm.method} onChange={e => setWithdrawForm(p => ({ ...p, method: e.target.value }))}>
                <option value="bank_transfer">🏦 Bank Transfer (NEFT/IMPS)</option>
                <option value="upi">📱 UPI (GPay, PhonePe, Paytm)</option>
                <option value="paypal">💵 PayPal</option>
                <option value="payoneer">💳 Payoneer</option>
              </select>
            </div>
            <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              ℹ️ Withdrawals processed within 1-3 business days. ₹25 fee for transfers under ₹10,000.
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={() => { setWithdrawModal(false); toast('Withdrawal initiated! Funds arrive in 1-3 business days. ✅', 'success'); }}>Withdraw Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsPage;
