import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

const DM_KEY = (id) => `lizi_dm_${id}`;

function loadMessages(convId) {
  try { return JSON.parse(localStorage.getItem(DM_KEY(convId)) || '[]'); }
  catch { return []; }
}

function saveMessages(convId, msgs) {
  try { localStorage.setItem(DM_KEY(convId), JSON.stringify(msgs)); } catch {}
}

const SEED_CONVERSATIONS = [
  { id: 1, name: 'Alex Producer', avatar: '🎧', preview: 'Hey, interested in collaborating?', time: '2 min', phone: '+1234567890', email: 'alex@example.com' },
  { id: 2, name: 'Sarah Singer',  avatar: '🎤', preview: 'I loved your last track!',         time: '1 hour', phone: '+1987654321', email: 'sarah@example.com' },
  { id: 3, name: 'Mike Drummer',  avatar: '🥁', preview: 'Let me know about that project...', time: '3 hours', phone: '+1555666777', email: 'mike@example.com' },
];

function seedInitialMessages(conv) {
  const existing = loadMessages(conv.id);
  if (existing.length > 0) return existing;
  const initial = [{ id: 1, text: conv.preview, sender: 'them', sentAt: new Date(Date.now() - 60000 * (conv.id * 10)).toISOString() }];
  saveMessages(conv.id, initial);
  return initial;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Messages() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState(() =>
    SEED_CONVERSATIONS.map(c => {
      const msgs = seedInitialMessages(c);
      const last = msgs[msgs.length - 1];
      return { ...c, preview: last?.text ?? c.preview };
    })
  );
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef(null);

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId == null) return;
    setMessages(loadMessages(selectedId));
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function selectConv(conv) {
    setSelectedId(conv.id);
    setDraft('');
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || !selectedId) return;
    const msg = { id: Date.now(), text, sender: 'me', sentAt: new Date().toISOString() };
    const next = [...messages, msg];
    saveMessages(selectedId, next);
    setMessages(next);
    setDraft('');
    setConversations(prev =>
      prev.map(c => c.id === selectedId ? { ...c, preview: text } : c)
    );
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function openEmail(email, name) {
    const subject = encodeURIComponent('Connecting on LIZI');
    const body    = encodeURIComponent(`Hi ${name},\n\nI'd like to connect with you on LIZI!`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  }

  function openWhatsApp(phone, name) {
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hi ${name}, I'd like to connect with you on LIZI!`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  }

  const filtered = search
    ? conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const myName = user?.user_metadata?.name || user?.email || 'You';

  return (
    <div className="page messages-page" style={{ flexDirection: 'column' }}>
      <section className="hero" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1>💬 {t('messages.title')}</h1>
      </section>

      <div className="messages-container" style={{ flex: 1 }}>
        {/* Sidebar */}
        <div className="messages-sidebar">
          <h2>{t('messages.title')}</h2>
          <input
            type="text"
            placeholder={t('messages.searchConversations')}
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="conversations-list">
            {filtered.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedId === conv.id ? 'active' : ''}`}
                onClick={() => selectConv(conv)}
              >
                <div className="avatar">{conv.avatar}</div>
                <div className="conversation-info">
                  <h4>{conv.name}</h4>
                  <p>{conv.preview}</p>
                </div>
                <span className="time">{conv.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="messages-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {!selectedConv ? (
            <div className="chat-area">
              <div className="no-selection">
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</p>
                <p>{t('messages.selectConversation')}</p>
              </div>
            </div>
          ) : (
            <div className="chat-selected" style={{ height: '100%' }}>
              {/* Header */}
              <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedConv.avatar}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{selectedConv.name}</h3>
                </div>
                <button
                  className="whatsapp-btn"
                  style={{ flex: 'none', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                  onClick={() => openWhatsApp(selectedConv.phone, selectedConv.name)}
                >
                  💬 WhatsApp
                </button>
                <button
                  className="email-btn"
                  style={{ flex: 'none', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                  onClick={() => openEmail(selectedConv.email, selectedConv.name)}
                >
                  📧 Email
                </button>
              </div>

              {/* Messages thread */}
              <div className="chat-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {messages.map(msg => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        {isMe ? myName : selectedConv.name}
                      </span>
                      <div
                        className={isMe ? 'message outgoing' : 'message incoming'}
                        style={{
                          background: isMe
                            ? 'linear-gradient(135deg, var(--music-pink), var(--music-purple))'
                            : 'rgba(0, 217, 255, 0.1)',
                          borderLeft: isMe ? 'none' : '3px solid var(--music-cyan)',
                          borderRight: isMe ? '3px solid var(--music-pink)' : 'none',
                          color: isMe ? '#fff' : 'var(--text-primary)',
                          maxWidth: '70%',
                        }}
                      >
                        <p style={{ margin: 0 }}>{msg.text}</p>
                        <span className="time-stamp">{formatTime(msg.sentAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input row */}
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 0 0' }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={2}
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.9rem',
                    background: 'rgba(0,217,255,0.05)',
                    border: '2px solid var(--music-cyan)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!draft.trim()}
                  style={{
                    padding: '0 1.2rem',
                    background: draft.trim()
                      ? 'linear-gradient(135deg, var(--music-pink), var(--music-purple))'
                      : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1.3rem',
                    cursor: draft.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s',
                    alignSelf: 'stretch',
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
