import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchArtists, fetchProjects, fetchAllTracks, fetchUserTracks, fetchUserProjects, sendProjectMessage } from '../lib/db';
import { useGeoContext } from '../GeoContext';
import { proximityLabel } from '../lib/geolocation';
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

const GENRES_LIST = ['Pop','Rock','Jazz','Hip-Hop','Electronic','R&B','Folk','Classical','World','Reggae','Other'];
const INSTRUMENTS_LIST = [
  'Guitar','Bass Guitar','Electric Guitar','Acoustic Guitar',
  'Piano','Keyboards','Synthesizer','Drums','Percussion',
  'Vocals','Backing Vocals','Violin','Cello','Saxophone',
  'Trumpet','Flute','Clarinet','Oud','DJ / Turntables',
  'Production','Beatmaking','Songwriting','Mixing / Mastering','Other',
];

function Search() {
  const [query, setQuery]                       = useState('');
  const [filterGenre, setFilterGenre]           = useState('');
  const [filterInstrument, setFilterInstrument] = useState('');
  const [followed, setFollowed]                 = useState(new Set());
  const [allArtists, setAllArtists]             = useState([]);
  const [allProjects, setAllProjects]           = useState([]);
  const [allTracks, setAllTracks]               = useState([]);

  // Collab panel state
  const [collabArtist, setCollabArtist]       = useState(null);
  const [collabTab, setCollabTab]             = useState('tracks');
  const [artistTracks, setArtistTracks]       = useState([]);
  const [tracksLoading, setTracksLoading]     = useState(false);
  const [userProjects, setUserProjects]       = useState([]);
  const [inviteProjectId, setInviteProjectId] = useState('');
  const [inviteNote, setInviteNote]           = useState('');
  const [inviteSent, setInviteSent]           = useState(false);
  const [connectMsg, setConnectMsg]           = useState('');
  const panelRef       = useRef(null);
  const recognitionRef = useRef(null);

  const { city: detectedCity } = useGeoContext();
  const { t, language }        = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /* ── Voice search ──────────────────────────────────────────────── */
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceSupported    = Boolean(SpeechRecognition);
  const [voiceState, setVoiceState] = useState('idle');

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState('idle');
  }, []);

  const startVoice = useCallback(() => {
    if (!voiceSupported) return;
    if (voiceState === 'listening') { stopVoice(); return; }
    const rec = new SpeechRecognition();
    rec.lang            = language === 'he' ? 'he-IL' : 'en-US';
    rec.interimResults  = true;
    rec.maxAlternatives = 1;
    rec.continuous      = false;
    rec.onstart  = () => setVoiceState('listening');
    rec.onerror  = () => setVoiceState('error');
    rec.onend    = () => setVoiceState('idle');
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setQuery(transcript);
      if (e.results[e.results.length - 1].isFinal) stopVoice();
    };
    recognitionRef.current = rec;
    rec.start();
  }, [voiceSupported, voiceState, language, stopVoice, SpeechRecognition]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  /* ── Data loading ──────────────────────────────────────────────── */
  useEffect(() => {
    fetchArtists().then(setAllArtists);
    fetchProjects().then(setAllProjects);
    if (isAuthenticated) fetchAllTracks().then(setAllTracks);
  }, [isAuthenticated]);

  // Load user's own projects when collab panel opens
  useEffect(() => {
    if (collabArtist && user) fetchUserProjects(user.id).then(setUserProjects);
  }, [collabArtist, user]);

  // Load artist's tracks when collab panel opens
  useEffect(() => {
    if (!collabArtist) return;
    if (collabArtist.userId) {
      setTracksLoading(true);
      fetchUserTracks(collabArtist.userId).then(setArtistTracks).finally(() => setTracksLoading(false));
    } else {
      setArtistTracks([]);
    }
  }, [collabArtist]);

  /* ── Collab panel actions ──────────────────────────────────────── */
  const openCollab  = (artist) => {
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
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ── Unified search across all three sources ───────────────────── */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !filterGenre && !filterInstrument) return [];

    const match = (...fields) =>
      !q || fields.some(f => (f || '').toLowerCase().includes(q));

    const out = [];

    // Artists — always visible (even to guests)
    allArtists.forEach(a => {
      if (
        match(a.name, a.genre, a.instruments, a.style) &&
        (!filterGenre     || a.genre.toLowerCase() === filterGenre.toLowerCase()) &&
        (!filterInstrument || (a.instruments || '').toLowerCase().includes(filterInstrument.toLowerCase()))
      ) out.push({ ...a, _type: 'artist' });
    });

    // Tracks + Projects — authenticated users only (RLS gates them anyway)
    if (isAuthenticated) {
      allTracks.forEach(t => {
        if (
          match(t.title, t.genre, t.uploaderName) &&
          (!filterGenre || (t.genre || '').toLowerCase() === filterGenre.toLowerCase())
        ) out.push({ ...t, _type: 'track' });
      });

      allProjects.forEach(p => {
        if (
          match(p.title, p.genre, p.instruments, p.description) &&
          (!filterGenre     || (p.genre || '').toLowerCase() === filterGenre.toLowerCase()) &&
          (!filterInstrument || (p.instruments || '').toLowerCase().includes(filterInstrument.toLowerCase()))
        ) out.push({ ...p, _type: 'project' });
      });
    }

    return out;
  }, [query, allArtists, allTracks, allProjects, isAuthenticated, filterGenre, filterInstrument]);

  const hasQuery = query.trim() || filterGenre || filterInstrument;

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
      <div className={`search-track-bar ${voiceState === 'listening' ? 'search-track-bar--listening' : ''}`}>
        <span className="search-track-icon">🔍</span>
        <input
          type="text"
          placeholder={
            voiceState === 'listening'
              ? (language === 'he' ? 'מדבר…' : 'Listening…')
              : t('search.placeholder')
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-track-input"
          autoFocus
        />
        {query && voiceState !== 'listening' && (
          <button className="search-clear-btn" onClick={() => setQuery('')}>✕</button>
        )}
        {voiceSupported && (
          <button
            className={`voice-search-btn voice-search-btn--${voiceState}`}
            onClick={startVoice}
            title={
              voiceState === 'listening'
                ? (language === 'he' ? 'עצור האזנה' : 'Stop listening')
                : (language === 'he' ? 'חיפוש קולי'  : 'Voice search')
            }
            aria-label="Voice search"
          >
            {voiceState === 'listening' ? (
              <span className="voice-pulse-ring">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
                  <path d="M17 11a1 1 0 0 0-2 0 3 3 0 0 1-6 0 1 1 0 0 0-2 0 5 5 0 0 0 4 4.9V18H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.1A5 5 0 0 0 17 11z"/>
                </svg>
              </span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
                <path d="M17 11a1 1 0 0 0-2 0 3 3 0 0 1-6 0 1 1 0 0 0-2 0 5 5 0 0 0 4 4.9V18H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.1A5 5 0 0 0 17 11z"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {voiceState === 'error' && (
        <p className="voice-error-msg">
          {language === 'he'
            ? '⚠️ לא ניתן לגשת למיקרופון. בדוק הרשאות.'
            : '⚠️ Microphone access denied. Check your browser permissions.'}
        </p>
      )}

      {/* Filters */}
      <div className="search-browse-filters">
        <select
          className="genre-filter-dropdown"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          style={filterGenre ? { borderColor: genreColor(filterGenre), boxShadow: `0 0 0 1px ${genreColor(filterGenre)}44` } : {}}
        >
          <option value="">🎵 All Genres</option>
          {GENRES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          className="genre-filter-dropdown"
          value={filterInstrument}
          onChange={(e) => setFilterInstrument(e.target.value)}
          style={filterInstrument ? { borderColor: 'var(--music-pink)', boxShadow: '0 0 0 1px rgba(255,0,110,0.3)' } : {}}
        >
          <option value="">🎸 All Instruments</option>
          {INSTRUMENTS_LIST.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        {(filterGenre || filterInstrument) && (
          <button className="studio-cancel-btn" onClick={() => { setFilterGenre(''); setFilterInstrument(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Guest login banner — shown when search is active but user is not logged in */}
      {!isAuthenticated && hasQuery && (
        <div className="search-guest-banner">
          <span>
            🔒 {language === 'he'
              ? 'התחבר כדי לחפש גם בשירים ובפרויקטים'
              : 'Log in to also search tracks and projects'}
          </span>
          <button className="search-guest-login-btn" onClick={() => navigate('/login')}>
            {language === 'he' ? 'התחברות' : 'Log in'}
          </button>
        </div>
      )}

      {/* ── Unified results ──────────────────────────────────────────── */}
      {hasQuery && (
        <section className="search-section">
          <div className="search-section-header">
            <span className="search-section-icon">🔍</span>
            <h2 className="search-section-title">
              {language === 'he' ? 'תוצאות חיפוש' : 'Search Results'}
            </h2>
            <span className="search-section-count">
              {results.length} {language === 'he' ? 'תוצאות' : t('search.found')}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="search-empty">
              <span className="search-empty-icon">🎵</span>
              <p>
                {language === 'he'
                  ? `אין תוצאות עבור "${query.trim() || filterGenre}" — נסה מילה אחרת`
                  : `No results for "${query.trim() || filterGenre}" — try a different word`}
              </p>
            </div>
          ) : (
            <div className="artist-track-list">
              {results.map((item, idx) => {

                /* ── Artist card ── */
                if (item._type === 'artist') return (
                  <div key={`a${item.id}`} className="artist-track-card">
                    <span className="track-number">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="search-type-badge search-type-badge--artist">🎤 {language === 'he' ? 'אמן' : 'Artist'}</div>
                    <div className="artist-vinyl" style={{ '--genre-color': genreColor(item.genre) }}>
                      <span className="artist-vinyl-emoji">{item.avatar || '🎤'}</span>
                    </div>
                    <div className="artist-track-info">
                      <span className="artist-track-name">{item.name}</span>
                      <div className="artist-track-meta">
                        <span className="genre-chip" style={{ '--chip-color': genreColor(item.genre) }}>{item.genre}</span>
                        {item.style && <span className="style-chip">{item.style}</span>}
                        {item.instruments && <span className="instruments-chip">🎸 {item.instruments}</span>}
                      </div>
                      {item.location && (
                        <span className="artist-location" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          📍 {item.location}
                          {(() => {
                            const prox = proximityLabel(detectedCity, item.location);
                            if (!prox) return null;
                            const labels = { exact: t('geo.nearYou'), nearby: t('geo.nearby'), remote: t('geo.remote') };
                            return (
                              <span className={`near-you-badge near-you-badge--${prox}`}>
                                {prox === 'exact' ? '📍' : prox === 'remote' ? '🌐' : '🗺️'} {labels[prox]}
                              </span>
                            );
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="artist-track-right">
                      <span className="artist-followers">
                        {(item.followers || 0).toLocaleString()} {t('search.followers')}
                      </span>
                      <button
                        className={`follow-track-btn${followed.has(item.id) ? ' is-following' : ''}`}
                        onClick={() => toggleFollow(item.id)}
                      >
                        {followed.has(item.id) ? t('search.followingBtn') : t('search.followBtn')}
                      </button>
                      <button className="collab-invite-btn" onClick={() => openCollab(item)}>
                        🎵 Collaborate
                      </button>
                    </div>
                  </div>
                );

                /* ── Track card ── */
                if (item._type === 'track') return (
                  <div key={`t${item.id}`} className="artist-track-card search-track-result">
                    <span className="track-number">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="search-type-badge search-type-badge--track">🎵 {language === 'he' ? 'שיר' : 'Track'}</div>
                    <div className="artist-vinyl" style={{ '--genre-color': genreColor(item.genre) }}>
                      <span className="artist-vinyl-emoji">🎵</span>
                    </div>
                    <div className="artist-track-info" style={{ flex: 1 }}>
                      <span className="artist-track-name">{item.title}</span>
                      <div className="artist-track-meta">
                        {item.genre && <span className="genre-chip" style={{ '--chip-color': genreColor(item.genre) }}>{item.genre}</span>}
                        {item.uploaderName && <span className="style-chip">👤 {item.uploaderName}</span>}
                      </div>
                      {item.url && (
                        <audio
                          src={item.url}
                          controls
                          preload="none"
                          className="feed-track-player"
                          style={{ marginTop: '0.5rem' }}
                        />
                      )}
                    </div>
                  </div>
                );

                /* ── Project card ── */
                if (item._type === 'project') return (
                  <div key={`p${item.id}`} className="artist-track-card search-project-result">
                    <span className="track-number">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="search-type-badge search-type-badge--project">🎼 {language === 'he' ? 'פרויקט' : 'Project'}</div>
                    <div className="artist-vinyl" style={{ '--genre-color': genreColor(item.genre) }}>
                      <span className="artist-vinyl-emoji">🎼</span>
                    </div>
                    <div className="artist-track-info" style={{ flex: 1 }}>
                      <span className="artist-track-name">{item.title}</span>
                      <div className="artist-track-meta">
                        {item.genre && <span className="genre-chip" style={{ '--chip-color': genreColor(item.genre) }}>{item.genre}</span>}
                        {item.instruments && <span className="instruments-chip">🎸 {item.instruments}</span>}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                          {item.description.length > 100 ? item.description.slice(0, 100) + '…' : item.description}
                        </p>
                      )}
                      {item.location && (
                        <span className="artist-location" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                          📍 {item.location}
                        </span>
                      )}
                    </div>
                    <div className="artist-track-right">
                      <Link to={`/project/${item.id}`} className="collab-invite-btn">
                        👁 View
                      </Link>
                    </div>
                  </div>
                );

                return null;
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Browse all projects (shown when no active search) ──────── */}
      {!hasQuery && (
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
                const color       = genreColor(project.genre);
                const memberCount = project.members || 1;
                return (
                  <div key={project.id} className="project-studio-card" style={{ '--project-color': color }}>
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
                      {project.instruments && <span className="project-tag">🎸 {project.instruments}</span>}
                      {project.ageRange    && <span className="project-tag">👤 {t('search.ages')} {project.ageRange}</span>}
                      {project.location    && (
                        <span className="project-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          📍 {project.location}
                          {(() => {
                            const prox = proximityLabel(detectedCity, project.location);
                            if (!prox) return null;
                            const labels = { exact: t('geo.nearYou'), nearby: t('geo.nearby'), remote: t('geo.remote') };
                            return (
                              <span className={`near-you-badge near-you-badge--${prox}`}>
                                {prox === 'exact' ? '📍' : prox === 'remote' ? '🌐' : '🗺️'} {labels[prox]}
                              </span>
                            );
                          })()}
                        </span>
                      )}
                    </div>
                    <Link to={`/project/${project.id}`} className="project-studio-view-btn" style={{ '--project-color': color }}>
                      👁 View Project & Members
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Collaborate panel ─────────────────────────────────────── */}
      {collabArtist && (
        <div className="collab-panel-overlay" onClick={(e) => e.target === e.currentTarget && closeCollab()}>
          <div className="collab-panel" ref={panelRef}>
            <button className="collab-panel-close" onClick={closeCollab} aria-label="Close">✕</button>

            <div className="collab-panel-header" style={{ '--panel-color': genreColor(collabArtist.genre) }}>
              <div className="collab-panel-avatar">{collabArtist.avatar || '🎤'}</div>
              <div className="collab-panel-info">
                <h3 className="collab-panel-name">{collabArtist.name}</h3>
                <div className="collab-panel-chips">
                  <span className="mpc-chip mpc-chip-genre">{collabArtist.genre}</span>
                  {collabArtist.style && <span className="mpc-chip mpc-chip-style">{collabArtist.style}</span>}
                </div>
                {collabArtist.instruments && <p className="collab-panel-instruments">🎸 {collabArtist.instruments}</p>}
                {collabArtist.location    && <p className="collab-panel-location">📍 {collabArtist.location}</p>}
              </div>
            </div>

            <div className="modal-tabs" style={{ marginTop: '0.75rem' }}>
              {['tracks','invite','connect'].map(tab => (
                <button key={tab} className={`modal-tab ${collabTab === tab ? 'active' : ''}`} onClick={() => setCollabTab(tab)}>
                  {tab === 'tracks' ? '🎵 Tracks' : tab === 'invite' ? '📩 Invite' : '💬 Connect'}
                </button>
              ))}
            </div>

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
                          : <span className="project-track-no-audio">No audio</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                        {userProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
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

            {collabTab === 'connect' && (
              <div className="collab-panel-tab-body">
                <p className="collab-form-label" style={{ marginBottom: '0.75rem' }}>
                  Reach out to {collabArtist.name} directly:
                </p>
                <div className="collab-connect-btns">
                  <button
                    className="mpc-contact-btn mpc-whatsapp"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                    onClick={() => {
                      const phone = (collabArtist.phone || '').replace(/\D/g, '');
                      const msg   = encodeURIComponent(
                        connectMsg.trim() ||
                        `Hi ${collabArtist.name}! I found your profile on LIZI and would love to collaborate on music 🎵`
                      );
                      window.open(phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
                    }}
                  >
                    📱 WhatsApp
                  </button>
                  {collabArtist.facebook && (
                    <button className="mpc-contact-btn mpc-facebook" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => window.open(collabArtist.facebook, '_blank')}>
                      🔵 Facebook
                    </button>
                  )}
                  {collabArtist.email && (
                    <button className="mpc-contact-btn mpc-email" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                      onClick={() => {
                        const subject = encodeURIComponent('LIZI Music Collaboration');
                        const body    = encodeURIComponent(
                          connectMsg.trim() ||
                          `Hi ${collabArtist.name},\n\nI found your profile on LIZI and would love to collaborate!\n\nLet me know if you're interested 🎵`
                        );
                        window.open(`mailto:${collabArtist.email}?subject=${subject}&body=${body}`);
                      }}>
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
