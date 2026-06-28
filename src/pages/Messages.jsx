import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import {
  fetchConversations, fetchMessages, sendDirectMessage,
  fetchProfilesByIds, fetchAllProfiles,
} from '../lib/db';
import './Pages.css';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function openWhatsApp(phone, name) {
  const cleanPhone = phone.replace(/\D/g, '');
  const text = encodeURIComponent(`Hi ${name}, I'd like to connect with you on LIZI!`);
  window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
}

function Messages() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // profiles: { [uuid]: { name, phone } }
  const [conversations,        setConversations]       = useState([]);
  const [selectedOtherUserId,  setSelectedOtherUserId] = useState(null);
  const [messages,             setMessages]            = useState([]);
  const [profiles,             setProfiles]            = useState({});
  const [draft,                setDraft]               = useState('');
  const [search,               setSearch]              = useState('');
  const [loadingConvs,         setLoadingConvs]        = useState(false);
  const [loadingMsgs,          setLoadingMsgs]         = useState(false);
  const [sending,              setSending]             = useState(false);
  const [sendError,            setSendError]           = useState('');
  const [showNewMsg,           setShowNewMsg]          = useState(false);
  const [allProfiles,          setAllProfiles]         = useState([]);
  const bottomRef = useRef(null);

  // Load conversation list on mount
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    setLoadingConvs(true);
    fetchConversations(user.id).then(async ({ data, error }) => {
      if (error) { console.error('[Messages] fetchConversations:', error); setLoadingConvs(false); return; }
      const ids = (data || []).map(c => c.otherUserId);
      if (ids.length > 0) {
        const { data: pData } = await fetchProfilesByIds(ids);
        const map = {};
        (pData || []).forEach(p => { map[p.id] = { name: p.name || null, phone: p.phone || null }; });
        setProfiles(prev => ({ ...prev, ...map }));
      }
      setConversations(data || []);
      setLoadingConvs(false);
    });
  }, [isAuthenticated, user?.id]);

  // Load thread when a conversation is selected
  useEffect(() => {
    if (!selectedOtherUserId || !user?.id) return;
    setLoadingMsgs(true);
    setMessages([]);
    fetchMessages(user.id, selectedOtherUserId).then(({ data, error }) => {
      if (error) console.error('[Messages] fetchMessages:', error);
      setMessages(data || []);
      setLoadingMsgs(false);
    });
  }, [selectedOtherUserId, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load all profiles when the new-message picker opens
  useEffect(() => {
    if (!showNewMsg || !isAuthenticated || !user?.id) return;
    fetchAllProfiles().then(({ data }) => {
      setAllProfiles((data || []).filter(p => p.id !== user.id));
    });
  }, [showNewMsg, isAuthenticated, user?.id]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !selectedOtherUserId || !user?.id || sending) return;
    setSending(true);
    setSendError('');
    const { data, error } = await sendDirectMessage(user.id, selectedOtherUserId, text);
    setSending(false);
    if (error) {
      setSendError(typeof error === 'string' ? error : 'Failed to send — please try again');
      return;
    }
    setMessages(prev => [...prev, data]);
    setDraft('');
    setConversations(prev => {
      const updated = { otherUserId: selectedOtherUserId, lastMessage: text, lastAt: data.created_at };
      const exists  = prev.some(c => c.otherUserId === selectedOtherUserId);
      if (exists) return prev.map(c => c.otherUserId === selectedOtherUserId ? updated : c);
      return [updated, ...prev];
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function selectConversation(otherUserId) {
    setSelectedOtherUserId(otherUserId);
    setDraft('');
    setSendError('');
  }

  function startNewConversation(profile) {
    setProfiles(prev => ({ ...prev, [profile.id]: { name: profile.name, phone: profile.phone || null } }));
    setSelectedOtherUserId(profile.id);
    setMessages([]);
    setShowNewMsg(false);
    setDraft('');
    setSendError('');
  }

  const getName      = uuid => profiles[uuid]?.name || `User ${uuid.slice(0, 8)}…`;
  const partnerPhone = selectedOtherUserId ? (profiles[selectedOtherUserId]?.phone || null) : null;
  const myName       = user?.user_metadata?.name || user?.email || 'You';
  const filtered     = search
    ? conversations.filter(c => getName(c.otherUserId).toLowerCase().includes(search.toLowerCase()))
    : conversations;

  // ── Guest gate ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="page messages-page">
        <div className="feed-guest-gate">
          <span className="feed-guest-icon">🔒</span>
          <h3>{t('messages.title')}</h3>
          <p>Log in to send and receive messages.</p>
          <button className="cta-button" onClick={() => navigate('/login')}>Log in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page messages-page" style={{ flexDirection: 'column' }}>
      <section className="hero" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1>💬 {t('messages.title')}</h1>
      </section>

      <div className="messages-container" style={{ flex: 1 }}>

        {/* ── Sidebar ── */}
        <div className="messages-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0, flex: 1 }}>{t('messages.title')}</h2>
            <button
              onClick={() => setShowNewMsg(v => !v)}
              style={{
                background: 'var(--music-purple)', border: 'none', borderRadius: '8px',
                color: '#fff', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem',
              }}
            >✏️ New</button>
          </div>

          {showNewMsg && (
            <div style={{ marginBottom: '0.75rem', background: 'rgba(83,74,183,0.15)', borderRadius: '8px', padding: '0.5rem' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Select someone to message:
              </p>
              {allProfiles.length === 0
                ? <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading…</p>
                : (
                  <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {allProfiles.map(p => (
                      <button
                        key={p.id}
                        onClick={() => startNewConversation(p)}
                        style={{
                          textAlign: 'left', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-color)', borderRadius: '6px',
                          padding: '0.35rem 0.6rem', color: 'var(--text-primary)',
                          cursor: 'pointer', fontSize: '0.85rem',
                        }}
                      >🎤 {p.name}</button>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          <input
            type="text"
            placeholder={t('messages.searchConversations')}
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="conversations-list">
            {loadingConvs ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>
                No conversations yet — click ✏️ New to start one.
              </p>
            ) : (
              filtered.map(conv => (
                <div
                  key={conv.otherUserId}
                  className={`conversation-item ${selectedOtherUserId === conv.otherUserId ? 'active' : ''}`}
                  onClick={() => selectConversation(conv.otherUserId)}
                >
                  <div className="avatar">🎤</div>
                  <div className="conversation-info">
                    <h4>{getName(conv.otherUserId)}</h4>
                    <p>{conv.lastMessage}</p>
                  </div>
                  <span className="time">{formatTime(conv.lastAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="messages-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {!selectedOtherUserId ? (
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
                <span style={{ fontSize: '1.8rem' }}>🎤</span>
                <h3 style={{ margin: 0, flex: 1 }}>{getName(selectedOtherUserId)}</h3>
                {partnerPhone && (
                  <button
                    className="whatsapp-btn"
                    style={{ flex: 'none', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                    onClick={() => openWhatsApp(partnerPhone, getName(selectedOtherUserId))}
                  >
                    💬 WhatsApp
                  </button>
                )}
              </div>

              {/* Thread */}
              <div className="chat-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loadingMsgs ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No messages yet — say hello!</p>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}
                      >
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                          {isMe ? myName : getName(selectedOtherUserId)}
                        </span>
                        <div
                          className={isMe ? 'message outgoing' : 'message incoming'}
                          style={{
                            background:  isMe ? 'linear-gradient(135deg, var(--music-pink), var(--music-purple))' : 'rgba(0,217,255,0.1)',
                            borderLeft:  isMe ? 'none' : '3px solid var(--music-cyan)',
                            borderRight: isMe ? '3px solid var(--music-pink)' : 'none',
                            color:       isMe ? '#fff' : 'var(--text-primary)',
                            maxWidth:    '70%',
                          }}
                        >
                          <p style={{ margin: 0 }}>{msg.content}</p>
                          <span className="time-stamp">{formatTime(msg.created_at)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {sendError && (
                <p style={{ color: '#ff4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{sendError}</p>
              )}

              {/* Input row */}
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 0 0' }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, padding: '0.6rem 0.9rem',
                    background: 'rgba(0,217,255,0.05)', border: '2px solid var(--music-cyan)',
                    borderRadius: '8px', color: 'var(--text-primary)',
                    fontSize: '0.95rem', resize: 'none', fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!draft.trim() || sending}
                  style={{
                    padding: '0 1.2rem',
                    background: (draft.trim() && !sending)
                      ? 'linear-gradient(135deg, var(--music-pink), var(--music-purple))'
                      : 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: '8px', color: '#fff',
                    fontSize: '1.3rem',
                    cursor: (draft.trim() && !sending) ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s', alignSelf: 'stretch',
                  }}
                >{sending ? '…' : '➤'}</button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Messages;
