import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  fetchProjectById, fetchProjectMembers, joinProject,
  fetchProjectTracks, addTrackToProject, removeTrackFromProject,
  fetchUserTracks,
  fetchProjectMessages, sendProjectMessage,
} from '../lib/db';
import './Pages.css';
import './ProjectDetail.css';

const GENRE_COLORS = {
  'Pop':        '#FF006E', 'Rock':       '#FF4500', 'Jazz':       '#FFD700',
  'Hip-Hop':    '#9B59B6', 'Electronic': '#00D9FF', 'R&B':        '#FF69B4',
  'Folk':       '#90EE90', 'Classical':  '#DDA0DD', 'World':      '#FFA500',
  'Reggae':     '#00FF7F', 'Other':      '#8A2BE2',
};
const genreColor = (g) => GENRE_COLORS[g] || '#8A2BE2';

function waveHeights(seed, bars) {
  return Array.from({ length: bars }, (_, i) =>
    18 + Math.abs(Math.sin((seed * 0.4 + i) * 1.1)) * 22
  );
}

export default function ProjectDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [project,   setProject]   = useState(null);
  const [members,   setMembers]   = useState([]);
  const [tracks,    setTracks]    = useState([]);
  const [messages,  setMessages]  = useState([]);
  const [userTracks, setUserTracks] = useState([]);
  const [tab,       setTab]       = useState('members');
  const [loading,   setLoading]   = useState(true);
  const [joining,   setJoining]   = useState(false);
  const [joined,    setJoined]    = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showSharePicker, setShowSharePicker] = useState(false);
  const chatEndRef = useRef(null);

  const color = genreColor(project?.genre);

  // Load project + members + tracks + chat
  useEffect(() => {
    setLoading(true);
    fetchProjectById(id).then(async (p) => {
      if (!p) { setLoading(false); return; }
      setProject(p);
      const [m, t, msg] = await Promise.all([
        fetchProjectMembers(id),
        Promise.resolve(fetchProjectTracks(id)),
        Promise.resolve(fetchProjectMessages(id)),
      ]);
      setMembers(m);
      setTracks(t);
      setMessages(msg);
      setLoading(false);
    });
  }, [id]);

  // Load current user's own tracks
  useEffect(() => {
    if (user) fetchUserTracks(user.id).then(setUserTracks);
  }, [user]);

  // Auto-scroll chat
  useEffect(() => {
    if (tab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tab]);

  const isMember = user && (
    project?.createdBy === user.id ||
    members.some(m => m.userId === user.id)
  );

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    setJoining(true);
    const meta = user.user_metadata || {};
    await joinProject(id, user.id, {
      name:       meta.name        || user.email?.split('@')[0] || 'Artist',
      instruments: meta.instruments || '',
      genre:      meta.favoriteGenres || '',
      style:      meta.musicStyle  || '',
      location:   meta.location    || '',
      avatar:     '🎤',
      bio:        meta.bio         || meta.about || '',
      lookingFor: meta.lookingFor  || '',
      phone:      meta.phone       || '',
      email:      typeof user.email === 'string' ? user.email : '',
      facebook:   meta.facebook    || '',
    });
    const m = await fetchProjectMembers(id);
    setMembers(m);
    setJoined(true);
    setJoining(false);
    setTab('members');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const next = sendProjectMessage(id, {
      text:         chatInput,
      senderName:   user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist',
      senderAvatar: '🎤',
    });
    setMessages(next);
    setChatInput('');
  };

  const handleShareTrack = (track) => {
    const next = addTrackToProject(id, {
      ...track,
      sharedBy:       user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member',
      sharedByUserId: user?.id,
    });
    setTracks(next);
    setShowSharePicker(false);
  };

  const handleRemoveTrack = (trackId) => {
    setTracks(removeTrackFromProject(id, trackId));
  };

  if (loading) {
    return (
      <div className="page pd-loading">
        <div className="pd-loading-wave">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="collab-eq-bar" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        <p>Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page pd-loading">
        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Project not found.</p>
        <button className="join-btn" style={{ margin: '1rem auto', display: 'block' }} onClick={() => navigate('/collaboration')}>
          ← Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="page pd-page">

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="pd-hero" style={{ '--pd-color': color }}>
        <div className="pd-hero-wave">
          {waveHeights(parseInt(id, 10) || 1, 24).map((h, i) => (
            <div
              key={i}
              className="pd-wave-bar"
              style={{ height: `${h}px`, background: color, animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>

        <div className="pd-hero-content">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <span className="pd-genre-badge" style={{ background: color }}>
            {project.genre || 'Music'}
          </span>
          <h1 className="pd-title">{project.title}</h1>

          <div className="pd-meta-row">
            {project.ageRange    && <span className="pd-meta-chip">👤 {project.ageRange}</span>}
            {project.location    && <span className="pd-meta-chip">📍 {project.location}</span>}
            {project.instruments && <span className="pd-meta-chip">🎸 {project.instruments}</span>}
            <span className="pd-meta-chip">👥 {members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>

          {project.description && (
            <p className="pd-description">{project.description}</p>
          )}

          {!isMember && !joined && (
            <button
              className="pd-join-btn"
              style={{ '--pd-color': color }}
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? 'Joining…' : `✅ Join this project`}
            </button>
          )}
          {(isMember || joined) && (
            <span className="pd-member-badge">✅ You're a member</span>
          )}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="pd-tabs" style={{ '--pd-color': color }}>
        <button className={`pd-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          👥 Members <span className="tab-badge">{members.length}</span>
        </button>
        {(isMember || joined) && (
          <>
            <button className={`pd-tab ${tab === 'tracks' ? 'active' : ''}`} onClick={() => setTab('tracks')}>
              🎵 Tracks <span className="tab-badge">{tracks.length}</span>
            </button>
            <button className={`pd-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>
              💬 Chat <span className="tab-badge">{messages.length}</span>
            </button>
          </>
        )}
      </div>

      {/* ── Members tab ─────────────────────────────────────── */}
      {tab === 'members' && (
        <div className="pd-section">
          {members.length === 0 ? (
            <div className="pd-empty">
              <span>🎵</span>
              <p>No members yet — be the first to join!</p>
            </div>
          ) : (
            <div className="pd-members-grid">
              {members.map((member, i) => (
                <div key={member.userId || i} className="pd-member-card" style={{ '--pd-color': color }}>
                  <div className="pd-mc-top">
                    <div className="pd-mc-avatar">{member.avatar || '🎤'}</div>
                    <div className="pd-mc-info">
                      <span className="pd-mc-name">{member.name}</span>
                      {member.joinedAt && (
                        <span className="pd-mc-joined">
                          Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {member.userId === project?.createdBy && (
                      <span className="pd-mc-owner-badge">Owner</span>
                    )}
                  </div>

                  {/* Genre + style + instruments chips */}
                  <div className="pd-mc-chips">
                    {member.genre && (
                      <span className="pd-mc-chip" style={{ background: genreColor(member.genre), color: '#fff' }}>
                        {member.genre}
                      </span>
                    )}
                    {member.style && (
                      <span className="pd-mc-chip pd-mc-chip-style">{member.style}</span>
                    )}
                    {member.instruments && member.instruments.split(',').map(ins => (
                      <span key={ins.trim()} className="pd-mc-chip pd-mc-chip-inst">🎸 {ins.trim()}</span>
                    ))}
                  </div>

                  {/* Bio + looking for */}
                  {(member.bio || member.lookingFor) && (
                    <div className="pd-mc-bio">
                      {member.bio && <p>{member.bio}</p>}
                      {member.lookingFor && (
                        <p className="pd-mc-looking">🔍 Looking for: {member.lookingFor}</p>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {member.location && (
                    <p className="pd-mc-location">📍 {member.location}</p>
                  )}

                  {/* Contact buttons */}
                  <div className="pd-mc-contact">
                    {member.phone && (
                      <button
                        className="pd-contact-btn pd-wa"
                        onClick={() => {
                          const phone = member.phone.replace(/\D/g, '');
                          const msg = encodeURIComponent(`Hi ${member.name}! I found you on the "${project.title}" project on LIZI 🎵`);
                          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                        }}
                      >📱 WhatsApp</button>
                    )}
                    {member.facebook && (
                      <button
                        className="pd-contact-btn pd-fb"
                        onClick={() => window.open(member.facebook, '_blank')}
                      >🔵 Facebook</button>
                    )}
                    {member.email && (
                      <button
                        className="pd-contact-btn pd-email"
                        onClick={() => {
                          const sub  = encodeURIComponent(`LIZI – ${project.title}`);
                          const body = encodeURIComponent(`Hi ${member.name},\n\nI saw your profile on the "${project.title}" project on LIZI. Let's collaborate! 🎵`);
                          window.open(`mailto:${member.email}?subject=${sub}&body=${body}`);
                        }}
                      >✉️ Email</button>
                    )}
                    {(isMember || joined) && !member.phone && !member.facebook && !member.email && (
                      <button className="pd-contact-btn pd-chat" onClick={() => setTab('chat')}>
                        💬 Message in Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tracks tab ──────────────────────────────────────── */}
      {tab === 'tracks' && (isMember || joined) && (
        <div className="pd-section">
          {tracks.length === 0 ? (
            <div className="pd-empty">
              <span>🎵</span>
              <p>No tracks shared yet. Share the first one!</p>
            </div>
          ) : (
            <div className="project-track-list">
              {tracks.map((track, i) => (
                <div key={track.id || i} className="project-track-row">
                  <span className="project-track-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="project-track-info">
                    <span className="project-track-title">{track.title}</span>
                    <span className="project-track-meta">
                      {track.genre && `${track.genre} · `}shared by {track.sharedBy || 'Member'}
                    </span>
                  </div>
                  {track.url
                    ? <audio className="project-track-player" src={track.url} controls preload="none" />
                    : <span className="project-track-no-audio">No audio</span>
                  }
                  {(project?.createdBy === user?.id || track.sharedByUserId === user?.id) && (
                    <button className="project-track-remove" onClick={() => handleRemoveTrack(track.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showSharePicker ? (
            <button className="pd-share-btn" style={{ '--pd-color': color }} onClick={() => setShowSharePicker(true)}>
              + Share a Track
            </button>
          ) : (
            <div className="share-picker" style={{ marginTop: '1rem' }}>
              <p className="share-picker-label">Pick from your library:</p>
              {userTracks.length === 0 ? (
                <p className="members-empty">No tracks uploaded yet.</p>
              ) : (
                <div className="share-picker-list">
                  {userTracks.map(track => (
                    <button key={track.id} className="share-picker-item" onClick={() => handleShareTrack(track)}>
                      <span className="share-picker-icon">🎵</span>
                      <span className="share-picker-name">{track.title}</span>
                      {track.genre && <span className="share-picker-genre">{track.genre}</span>}
                    </button>
                  ))}
                </div>
              )}
              <button className="studio-cancel-btn" style={{ marginTop: '0.5rem' }} onClick={() => setShowSharePicker(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* ── Chat tab ────────────────────────────────────────── */}
      {tab === 'chat' && (isMember || joined) && (
        <div className="pd-section pd-chat-section">
          <div className="pd-chat-messages">
            {messages.length === 0 ? (
              <div className="pd-empty">
                <span>💬</span>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === (user?.user_metadata?.name || user?.email?.split('@')[0]);
                return (
                  <div key={msg.id} className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-them'}`}>
                    {!isMe && <span className="chat-sender">{msg.senderAvatar} {msg.senderName}</span>}
                    <p className="chat-text">{msg.text}</p>
                    <span className="chat-time">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input-row pd-chat-form" onSubmit={handleSendMessage}>
            <input
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message…"
              autoComplete="off"
            />
            <button type="submit" className="chat-send-btn" disabled={!chatInput.trim()}>▶</button>
          </form>
        </div>
      )}
    </div>
  );
}
