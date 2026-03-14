import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messageAPI.getConversations().then(r => setConversations(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', msg => {
      if (activeConv && msg.sender._id === activeConv._id) {
        setMessages(prev => [...prev, msg]);
      }
      messageAPI.getConversations().then(r => setConversations(r.data.data || [])).catch(() => {});
    });
    return () => socket.off('newMessage');
  }, [socket, activeConv]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openConversation = async (conv) => {
    setActiveConv(conv.otherUser);
    try {
      const r = await messageAPI.getMessages(conv.otherUser._id);
      setMessages(r.data.data?.messages || []);
      await messageAPI.markAsRead(conv.otherUser._id);
    } catch {}
  };

  const sendMsg = async () => {
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    const msgText = input.trim();
    setInput('');
    try {
      const r = await messageAPI.sendMessage({ receiverId: activeConv._id, content: msgText });
      setMessages(prev => [...prev, r.data.data]);
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 120px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }} className="fade-up">
      <div style={{ background: 'var(--card-bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>💬 Messages</div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No conversations yet</div>
          ) : conversations.map(conv => (
            <div key={conv.conversationId} onClick={() => openConversation(conv)}
              style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: activeConv?._id === conv.otherUser?._id ? 'rgba(0,212,170,0.06)' : 'transparent', transition: 'background 0.15s', display: 'flex', gap: 10, alignItems: 'center' }}
              onMouseOver={e => { if (activeConv?._id !== conv.otherUser?._id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseOut={e => { if (activeConv?._id !== conv.otherUser?._id) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>
                {conv.otherUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{conv.otherUser?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage?.content?.substring(0, 40) || '...'}
                </div>
              </div>
              {conv.unreadCount > 0 && <span style={{ background: 'var(--accent)', color: 'var(--primary)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{conv.unreadCount}</span>}
            </div>
          ))}
        </div>
      </div>

      {activeConv ? (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--primary)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
              {activeConv.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{activeConv.name}</div>
              <div style={{ fontSize: 12, color: 'var(--success)' }}>● Online</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => {
              const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <div key={msg._id || i} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', background: isOwn ? 'var(--accent)' : 'var(--card-bg)', color: isOwn ? 'var(--primary)' : 'var(--text)', borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '12px 16px', fontSize: 14, border: isOwn ? 'none' : '1px solid var(--border)', lineHeight: 1.5 }}>
                    {msg.content}
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isOwn ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)', display: 'flex', gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
              placeholder="Type a message..." style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={sendMsg} disabled={!input.trim() || sending}>Send</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
