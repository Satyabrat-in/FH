import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';

const QUICK_ACTIONS_FL = [
  { icon: '✍️', label: 'Write a Proposal', prompt: 'Help me write a compelling proposal for a freelance project. Ask me for the job details first.' },
  { icon: '💰', label: 'Rate Advisor', prompt: 'What rate should I charge? Ask me about my skills, experience and the project type.' },
  { icon: '📊', label: 'Improve My JSS', prompt: 'Give me specific actionable tips to improve my Job Success Score.' },
  { icon: '📝', label: 'Profile Bio', prompt: 'Help me write a strong freelancer profile bio. Ask about my skills first.' },
  { icon: '🎯', label: 'Proposal Feedback', prompt: "I'll paste my proposal draft — give me honest feedback to improve it." },
  { icon: '💬', label: 'Client Message', prompt: "Help me draft a professional message to a client. Ask me what I need to communicate." },
];

const QUICK_ACTIONS_EM = [
  { icon: '📋', label: 'Write a Job Post', prompt: 'Help me write a clear detailed job post to attract great freelancers. Ask about the project first.' },
  { icon: '💰', label: 'Budget Advice', prompt: "What's a realistic budget for my project? Ask about scope, timeline and requirements." },
  { icon: '🔍', label: 'Shortlist Help', prompt: "I'll paste freelancer proposals — help me identify the best fit." },
  { icon: '💬', label: 'Interview Questions', prompt: 'Generate smart interview questions for a freelancer I am about to hire. Ask the role details first.' },
  { icon: '📑', label: 'Contract Advice', prompt: 'What should I include in a freelance contract? Ask me about the project type.' },
  { icon: '⚡', label: 'Project Scoping', prompt: 'Help me scope a freelance project — define deliverables, milestones and timeline.' },
];

const ClaudeAIPage = () => {
  const { user, isFreelancer } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = isFreelancer ? QUICK_ACTIONS_FL : QUICK_ACTIONS_EM;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = [...messages, userMsg];

    try {
      const res = await aiAPI.chat({
        messages: history,
        userRole: user?.role,
        userName: user?.name
      });
      const reply = res.data?.data?.reply || 'Sorry, I could not generate a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Unable to connect to Claude right now. Please check your server configuration and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*)/gm, '<h4 style="margin:12px 0 6px;font-size:14px;font-weight:700;">$1</h4>')
      .replace(/^## (.*)/gm, '<h3 style="margin:14px 0 8px;font-size:15px;font-weight:700;">$1</h3>')
      .replace(/^- (.*)/gm, '<li style="margin-left:16px;margin-bottom:4px;list-style:disc;">$1</li>')
      .replace(/\n\n/g, '</p><p style="margin-top:10px;">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 800, flexShrink: 0 }}>✦</div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Claude AI Assistant</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Powered by Anthropic · Your intelligent freelancing companion</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>claude-sonnet-4-5</span>
        </div>
      </div>

      {messages.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>Quick actions:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickActions.map(a => (
              <button key={a.label} onClick={() => sendMessage(a.prompt)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text)', fontFamily: "'Sora',sans-serif", transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, color: '#fff', fontWeight: 800 }}>✦</div>
            <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', maxWidth: '80%', fontSize: 14, lineHeight: 1.7 }}>
              Hi <strong>{user?.name}</strong>! 👋 I'm Claude, your AI assistant on FreelanceHub — powered by Anthropic.<br /><br />
              I can help you {isFreelancer ? 'write winning proposals, set competitive rates, improve your JSS, craft client messages, and grow your freelancing career' : 'write compelling job posts, set realistic budgets, evaluate proposals, generate interview questions, and find the perfect freelancer'}.<br /><br />
              What would you like help with today?
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {msg.role === 'assistant' ? (
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, color: '#fff', fontWeight: 800 }}>✦</div>
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{
              background: msg.role === 'user' ? 'linear-gradient(135deg,rgba(0,212,170,0.12),rgba(124,58,237,0.08))' : 'var(--secondary)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,170,0.2)' : 'var(--border)'}`,
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              padding: '14px 18px', maxWidth: '78%', fontSize: 14, lineHeight: 1.7
            }} dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, color: '#fff', fontWeight: 800 }}>✦</div>
            <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px' }}>
              <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1s ${d}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <textarea ref={inputRef} value={input} onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'; }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask Claude anything about freelancing… (Enter to send, Shift+Enter for new line)"
          style={{ flex: 1, resize: 'none', minHeight: 46, maxHeight: 140, borderRadius: 12, fontSize: 14, lineHeight: 1.5 }} rows={1} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, opacity: !input.trim() || loading ? 0.5 : 1, transition: 'opacity 0.2s', color: '#fff' }}>
          ➤
        </button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--border-light)', marginTop: 8 }}>Claude can make mistakes. Verify important information. · Powered by Anthropic</p>
    </div>
  );
};

export default ClaudeAIPage;
