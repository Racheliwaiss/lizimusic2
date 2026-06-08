import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchArtists, fetchProjects, fetchUserTracks, fetchUserProjects, sendProjectMessage } from '../lib/db';
import './Pages.css';

const GENRE_COLORS = {
  'Pop':        '#FF006E',
  'Rock':       '#FF4500',
  'Jazz':       '#FFD700',
  'Hip-Hop':    '#9B59B6',
  'Electronic': '#00D9FF',
  'R&B':        '#FF69B4',
  'Folk':       '#90EE90',
  'Classical':  '#DDA0DD',
  'World':      '#FFA500',
  'Reggae':     '#00FF7F',
};

function genreColor(genre) {
  return GENRE_COLORS[genre] || '#8A2BE2';
}

function Search() {
  const [query, setQuery]             = useState('');
  const [followed, setFollowed]       = useState(new Set());
  const [allArtists, setAllArtists]   = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  // Collab panel state
  const [collabArtist, setCollabArtist]         = useState(null);
  const [collabTab, setCollabTab]               = useState('tracks');
  const [artistTracks, setArtistTracks]         = useState([]);
  const [tracksLoading, setTracksLoading]       = useState(false);
  const [userProjects, setUserProjects]         = useState([]);
  const [inviteProjectId, setInviteProjectId]   = useState('');
  const [inviteNote, setInviteNote]             = useState('');
  const [inviteSent, setInviteSent]             = useState(false);
  const [connectMsg, setConnectMsg]             = useState('');
  const panelRef = useRef(null);

  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArtists().then(setAllArtists);
    fetchProjects().then(setAllProjects);
  }, []);

  // Load user's projects when panel opens
  useEffect(() => {
    if (collabArtist && user) {
      fetchUserProjects(user.id).then(setUserProjects);
    }
  }, [collabArtist, user]);

  // Load artist's tracks when panel opens
  useEffect(() => {
    if (!collabArtist) return;
    if (collabArtist.userId) {
      setTracksLoading(true);
      fetchUserTracks(collabArtist.userId)
        .then(setArtistTracks)
        .finally(() => setTracksLoading(false));
    } else {
      setArtistTracks([]);
    }
  }, [collabArtist]);

  const openCollab = (artist) => {
    if (!user) { navigate('/login'); return; }
    setCollabArtist(artist);
    setCollabTab('tracks');
    setInviteProjectId('');
    setInviteNote('');
    setInviteSent(false);
    setConnectMsg('');
  };

  const closeCollab = () => setCollabArtist(null);

  const handleInvite = () => {
    if (!inviteProjectId) return;
    const project = userProjects.find(p => String(p.id) === String(inviteProjectId));
    if (!project) return;
    const note = inviteNote.trim() ||
      `Hey ${collabArtist.name}! I'd love to have you join my project "${project.title}" on LIZI 🎵`;
    sendProjectMessage(project.id, {
      text:         `💌 Collaboration invite sent to ${collabArtist.name}: "${note}"`,
      senderName:   user.user_metadata?.name || user.email?.split('@')[0] || 'Artist',
      senderAvatar: user.user_metadata?.avatar_url ? '📷' : '🎤',
    });
    setInviteSent(true);
  };

  const toggleFollow = (id) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allArtists.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.genre.toLowerCase().includes(q) ||
      (a.instruments || '').toLowerCase().includes(q) ||
      (a.style || '').toLowerCase().includes(q)
    );
  }, [query, allArtists]);

  return (
    <div className="page search-page-v2">

      {/* Hero */}
      <section className="search-hero">
        <div className="search-eq-bars">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="search-eq-bar" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <h1 className="search-hero-title">{t('search.heroTitle')}</h1>
        <p className="search-hero-sub">{t('search.heroSub')}</p>
      </section>

      {/* Search bar */}
      <div className="search-track-bar">
        <span className="search-track-icon">🎙️</span>
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-track-input"
          autoFocus
        />
        {query && (
          <button className="search-clear-btn" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {/* Artist results */}
      {query.trim() && (
        <section className="search-section">
          <div className="search-section-header">
            <span className="search-section-icon">🎤</span>
            <h2 className="search-section-title">{t('search.artistsSection')}</h2>
            <span className="search-section-count">{results.length} {t('search.found')}</span>
          </div>

          {results.length === 0 ? (
            <div className="search-empty">
              <span className="search-empty-icon">🎵</span>
              <p>{t('search.noArtistsFound')} &ldquo;{query.trim()}&rdquo;</p>
            </div>
          ) : (
            <div className="artist-track-list">
              {results.map((artist, idx) => (
                <div key={artist.id} className="artist-track-card">
                  <span className="track-number">{String(idx + 1).padStart(2, '0')}</span>
                  <div
                    className="artist-vinyl"
                    style={{ '--genre-color': genreColor(artist.genre) }}
                  >
                    <span className="artist-vinyl-emoji">{artist.avatar || '🎤'}</span>
                  </div>
                  <div className="artist-track-info">
                    <span className="artist-track-name">{artist.name}</span>
                    <div className="artist-track-meta">
                      <span className="genre-chip" style={{ '--chip-color': genreColor(artist.genre) }}>
                        {artist.genre}
                      </span>
                      {artist.style && <span className="style-chip">{artist.style}</span>}
                      {artist.instruments && (
                        <span className="instruments-chip">🎸 {artist.instruments}</span>
                      )}
                    </div>
                    {artist.location && (
                      <span className="artist-location">📍 {artist.location}</span>
                    )}
                  </div>
                  <div className="artist-track-right">
                    <span className="artist-followers">
                      {(artist.followers || 0).toLocaleString()} {t('search.followers')}
                    </span>
                    <button
                      className={`follow-track-btn${followed.has(artist.id) ? ' is-following' : ''}`}
                      onClick={() => toggleFollow(artist.id)}
                    >
                      {followed.has(artist.id) ? t('search.followingBtn') : t('search.followBtn')}
                    </button>
                    <button
                      className="collab-invite-btn"
                      onClick={() => openCollab(artist)}
                      title="Invite to collaborate"
                    >
                      🎵 Collaborate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* All Projects */}
      <section className="search-section">
        <div className="search-section-header">
          <span className="search-section-icon">🎛️</span>
          <h2 className="search-section-title">{t('search.projectsSection')}</h2>
          <span className="search-section-count">{allProjects.length} {t('search.projects')}</span>
        </div>

        {allProjects.length === 0 ? (
          <div className="search-empty">
            <span className="search-empty-icon">🥁</span>
            <p>{t('search.noProjects')}</p>
          </div>
        ) : (
          <div className="project-studio-grid">
            {allProjects.map((project) => {
              const color = genreColor(project.genre);
              const memberCount = project.members || 1;
              return (
                <div
                  key={project.id}
                  className="project-studio-card"
                  style={{ '--project-color': color }}
                >
                  <div className="project-studio-top">
                    <div className="project-studio-led" />
                    <span className="project-studio-genre">{project.genre || 'Various'}</span>
                    <span className="project-studio-members">
                      👥 {memberCount} {memberCount === 1 ? t('search.members') : t('search.membersPlural')}
                    </span>
                  </div>

                  <div className="project-studio-waveform">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className="project-waveform-bar"
                        style={{
                          height: `${20 + Math.sin(i * 1.3 + (project.id % 6)) * 14}px`,
                          animationDelay: `${i * 0.05}s`,
                          background: color,
                        }}
                      />
                    ))}
                  </div>

                  <h3 className="project-studio-title">{project.title}</h3>

                  {project.description && (
                    <p className="project-studio-desc">{project.description}</p>
                  )}

                  <div className="project-studio-tags">
                    {project.instruments && (
                      <span className="project-tag">🎸 {project.instruments}</span>
                    )}
                    {project.ageRange && (
                      <span className="project-tag">👤 {t('search.ages')} {project.ageRange}</span>
                    )}
                    {project.location && (
                      <span className="project-tag">📍 {project.location}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Collaborate panel ─────────────────────────────── */}
      {collabArtist && (
        <div className="collab-panel-overlay" onClick={(e) => e.target === e.currentTarget && closeCollab()}>
          <div className="collab-panel" ref={panelRef}>
            <button className="collab-panel-close" onClick={closeCollab} aria-label="Close">✕</button>

            {/* Artist header */}
            <div
              className="collab-panel-header"
              style={{ '--panel-color': genreColor(collabArtist.genre) }}
            >
              <div className="collab-panel-avatar">{collabArtist.avatar || '🎤'}</div>
              <div className="collab-panel-info">
                <h3 className="collab-panel-name">{collabArtist.name}</h3>
                <div className="collab-panel-chips">
                  <span className="mpc-chip mpc-chip-genre">{collabArtist.genre}</span>
                  {collabArtist.style && <span className="mpc-chip mpc-chip-style">{collabArtist.style}</span>}
                </div>
                {collabArtist.instruments && (
                  <p className="collab-panel-instruments">🎸 {collabArtist.instruments}</p>
                )}
                {collabArtist.location && (
                  <p className="collab-panel-location">📍 {collabArtist.location}</p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="modal-tabs" style={{ marginTop: '0.75rem' }}>
              <button
                className={`modal-tab ${collabTab === 'tracks' ? 'active' : ''}`}
                onClick={() => setCollabTab('tracks')}
              >
                🎵 Tracks
              </button>
              <button
                className={`modal-tab ${collabTab === 'invite' ? 'active' : ''}`}
                onClick={() => setCollabTab('invite')}
              >
                📩 Invite
              </button>
              <button
                className={`modal-tab ${collabTab === 'connect' ? 'active' : ''}`}
                onClick={() => setCollabTab('connect')}
              >
                💬 Connect
              </button>
            </div>

            {/* Tracks tab */}
            {collabTab === 'tracks' && (
              <div className="collab-panel-tab-body">
                {tracksLoading ? (
                  <p className="members-loading">Loading tracks…</p>
                ) : artistTracks.length === 0 ? (
                  <div className="collab-no-tracks">
                    <span className="collab-no-tracks-icon">🎵</span>
                    <p>{collabArtist.name} hasn't shared public tracks yet.</p>
                    <p className="collab-no-tracks-sub">Reach out via the Connect tab to request a listen.</p>
                  </div>
                ) : (
                  <div className="project-track-list">
                    {artistTracks.map((track, i) => (
                      <div key={track.id || i} className="project-track-row">
                        <span className="project-track-num">{String(i + 1).padStart(2, '0')}</span>
                        <div className="project-track-info">
                          <span className="project-track-title">{track.title}</span>
                          {track.genre && <span className="project-track-meta">{track.genre}</span>}
                        </div>
                        {track.url
                          ? <audio className="project-track-player" src={track.url} controls preload="none" />
                          : <span className="project-track-no-audio">No audio</span>
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invite to project tab */}
            {collabTab === 'invite' && (
              <div className="collab-panel-tab-body">
                {inviteSent ? (
                  <div className="collab-invite-sent">
                    <span className="collab-invite-sent-icon">✅</span>
                    <p>Invite recorded in your project's chat!</p>
                    <p className="collab-no-tracks-sub">
                      Share your project link with {collabArtist.name} to complete the invite.
                    </p>
                    <button className="mpc-contact-btn mpc-chat-tab" style={{ marginTop: '0.75rem' }} onClick={() => setInviteSent(false)}>
                      Send another
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="collab-form-label">Choose your project</label>
                    {userProjects.length === 0 ? (
                      <p className="members-empty">
                        You haven't created any projects yet.{' '}
                        <button className="collab-link-btn" onClick={() => navigate('/collaboration')}>Create one →</button>
                      </p>
                    ) : (
                      <select
                        className="genre-filter-dropdown"
                        style={{ width: '100%', marginBottom: '0.75rem' }}
                        value={inviteProjectId}
                        onChange={(e) => setInviteProjectId(e.target.value)}
                      >
                        <option value="">— Pick a project —</option>
                        {userProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    )}

                    <label className="collab-form-label">Personal note (optional)</label>
                    <textarea
                      className="collab-note-input"
                      rows={3}
                      placeholder={`Hi ${collabArtist.name}, I think you'd be a great fit for my project because…`}
                      value={inviteNote}
                      onChange={(e) => setInviteNote(e.target.value)}
                    />

                    <button
                      className="join-btn"
                      style={{ width: '100%', marginTop: '0.75rem', padding: '10px' }}
                      onClick={handleInvite}
                      disabled={!inviteProjectId}
                    >
                      📩 Send Invite to {collabArtist.name}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Connect tab */}
            {collabTab === 'connect' && (
              <div className="collab-panel-tab-body">
                <p className="collab-form-label" style={{ marginBottom: '0.75rem' }}>
                  Reach out to {collabArtist.name} directly:
                </p>

                <div className="collab-connect-btns">
                  {collabArtist.phone ? (
                    <button
                      className="mpc-contact-btn mpc-whatsapp"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => {
                        const phone = collabArtist.phone.replace(/\D/g, '');
                        const msg = encodeURIComponent(
                          connectMsg.trim() ||
                          `Hi ${collabArtist.name}! I found your profile on LIZI and would love to collaborate on music 🎵`
                        );
                        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                      }}
                    >
                      📱 WhatsApp
                    </button>
                  ) : (
                    <button
                      className="mpc-contact-btn mpc-whatsapp"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => {
                        const msg = encodeURIComponent(
                          connectMsg.trim() ||
                          `Hi ${collabArtist.name}! I found your profile on LIZI and would love to collaborate 🎵`
                        );
                        window.open(`https://wa.me/?text=${msg}`, '_blank');
                      }}
                    >
                      📱 WhatsApp
                    </button>
                  )}

                  {collabArtist.facebook && (
                    <button
                      className="mpc-contact-btn mpc-facebook"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => window.open(collabArtist.facebook, '_blank')}
                    >
                      🔵 Facebook
                    </button>
                  )}
                  {collabArtist.email && (
                    <button
                      className="mpc-contact-btn mpc-email"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => {
                        const subject = encodeURIComponent(`LIZI Music Collaboration`);
                        const body = encodeURIComponent(
                          connectMsg.trim() ||
                          `Hi ${collabArtist.name},\n\nI found your profile on LIZI and would love to collaborate!\n\nLet me know if you're interested 🎵`
                        );
                        window.open(`mailto:${collabArtist.email}?subject=${subject}&body=${body}`);
                      }}
                    >
                      ✉️ Email
                    </button>
                  )}
                </div>

                <label className="collab-form-label" style={{ marginTop: '1rem' }}>
                  Personalise your message (optional)
                </label>
                <textarea
                  className="collab-note-input"
                  rows={3}
                  placeholder={`Hi ${collabArtist.name}, I love your ${collabArtist.genre} style and…`}
                  value={connectMsg}
                  onChange={(e) => setConnectMsg(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
