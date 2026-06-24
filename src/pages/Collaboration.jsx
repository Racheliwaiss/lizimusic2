import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import LocationDetector from '../components/LocationDetector';
import { proximityLabel } from '../lib/geolocation';
import {
  fetchProjects, createProject, updateProject, deleteProject,
  joinProject, fetchProjectMembers,
  fetchUserTracks,
  fetchProjectTracks, addTrackToProject, removeTrackFromProject,
  fetchProjectMessages, sendProjectMessage,
} from '../lib/db';
import './Pages.css';

const EMPTY_FORM = { title: '', genre: '', instruments: '', ageRange: '', location: '', description: '' };

const GENRES = [
  'Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Electronic',
  'R&B', 'Folk', 'Classical', 'World', 'Reggae', 'Other',
];

const AGE_RANGES = [
  '16-25', '18-30', '18-35', '20-40', '25-50', '16+', '18+', '25+', 'All ages',
];

const INSTRUMENTS = [
  'Guitar', 'Bass Guitar', 'Electric Guitar', 'Acoustic Guitar',
  'Piano', 'Keyboards', 'Synthesizer',
  'Drums', 'Percussion', 'Drum Machine',
  'Vocals', 'Backing Vocals',
  'Violin', 'Cello', 'Viola', 'Strings',
  'Saxophone', 'Trumpet', 'Trombone', 'Flute', 'Clarinet',
  'Oud', 'Banjo', 'Ukulele', 'Mandolin', 'Harmonica',
  'DJ / Turntables', 'Production', 'Beatmaking',
  'Songwriting', 'Composition', 'Mixing / Mastering',
  'Other',
];

const LOCATIONS = [
  'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Rishon LeZion',
  'Petah Tikva', 'Netanya', 'Ashdod', 'Rehovot', 'Ramat Gan',
  'Herzliya', 'Raanana', 'Holon', 'Bat Yam', 'Bnei Brak',
  'Eilat', 'Tiberias', 'Nazareth', 'Safed', "Modi'in",
  'Jaffa', 'Ramat Hasharon', 'Givatayim', 'Kfar Saba',
  'Remote / Online',
];

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
  'Other':      '#8A2BE2',
};

function genreColor(genre) {
  return GENRE_COLORS[genre] || '#8A2BE2';
}

// Stable waveform heights per project id
function waveHeights(seed, bars = 14) {
  return Array.from({ length: bars }, (_, i) =>
    18 + Math.abs(Math.sin(i * 1.7 + (seed % 7))) * 16
  );
}

const parseAgeRange = (range) => {
  const s = String(range || '').trim();
  if (!s) return null;
  const pm = s.match(/^(\d+)\+$/);
  if (pm) return { min: +pm[1], max: Infinity };
  const bm = s.match(/^(\d+)[^\d]+(\d+)$/);
  if (bm) return { min: +bm[1], max: +bm[2] };
  const n = Number(s.replace(/\D/g, ''));
  return Number.isNaN(n) ? null : { min: n, max: n };
};
const rangeOverlap = (a, b) => a && b && a.min <= b.max && b.min <= a.max;

function Collaboration() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [projects, setProjects]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [formOpen, setFormOpen]             = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData]             = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [viewProject, setViewProject]       = useState(null);
  const [viewMembers, setViewMembers]       = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [openMenuId, setOpenMenuId]         = useState(null);
  const menuRefs                            = useRef({});
  const [formError, setFormError]           = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAll, setShowAll]               = useState(false);
  const [genreFilter, setGenreFilter]       = useState('');
  const [detectedCity, setDetectedCity]     = useState(null);
  const handleCityDetected = useCallback((city) => setDetectedCity(city), []);

  // Modal tabs
  const [modalTab, setModalTab]             = useState('members');  // 'members' | 'tracks' | 'chat'
  const [projectTracks, setProjectTracks]   = useState([]);
  const [userTracks, setUserTracks]         = useState([]);
  const [messages, setMessages]             = useState([]);
  const [chatInput, setChatInput]           = useState('');
  const [showSharePicker, setShowSharePicker] = useState(false);
  const chatEndRef                          = useRef(null);

  useEffect(() => {
    fetchProjects().then((data) => { setProjects(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => {
      const ref = menuRefs.current[openMenuId];
      if (ref && !ref.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // ── Form helpers ──────────────────────────────────────────
  const openNewForm = () => {
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setFormData({
      title:       project.title,
      genre:       project.genre,
      instruments: project.instruments,
      ageRange:    project.ageRange,
      location:    project.location || '',
      description: project.description,
    });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  }, []);

  const handleFieldChange = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  // ── CREATE / UPDATE ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const { title, genre, instruments, ageRange, description } = formData;
    if (!title.trim() || !genre.trim() || !instruments.trim()) {
      setFormError('Please fill in title, genre, and instruments.');
      return;
    }

    const fields = {
      title:       title.trim(),
      genre:       genre.trim(),
      instruments: instruments.trim(),
      ageRange:    ageRange.trim(),
      location:    formData.location.trim(),
      description: description.trim() || 'A fresh collaboration idea waiting for artists.',
    };

    if (editingProject) {
      const { error } = await updateProject(editingProject.id, fields);
      if (error) { setFormError(`Could not save: ${error}`); return; }
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...fields } : p));
      setSuccessMessage('Project updated.');
    } else {
      const { project, error: createErr } = await createProject(fields, user?.id);
      if (createErr && !project) console.warn('createProject fallback:', createErr);
      const saved = project
        ? { ...project, createdBy: user?.id }
        : { id: Date.now(), ...fields, members: 1, createdBy: user?.id };
      setProjects(prev => [saved, ...prev]);

      const creatorProfile = {
        name:        user?.user_metadata?.name || user?.email?.split('@')[0] || 'Creator',
        instruments: user?.user_metadata?.instruments || '',
        genre:       user?.user_metadata?.favoriteGenres || '',
        location:    user?.user_metadata?.location || '',
        avatar:      '👑',
      };
      await joinProject(saved.id, user?.id, creatorProfile);
      setSuccessMessage('Project created! You are now the first member.');
    }
    closeForm();
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteProject(deleteTarget.id);
    if (error) { setFormError(`Delete failed: ${error}`); setDeleteTarget(null); return; }
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    setSuccessMessage('Project deleted.');
  };

  // ── Detail modal ──────────────────────────────────────────
  const openDetailModal = (project) => {
    setViewProject(project);
    setViewMembers([]);
    setMembersLoading(true);
    setModalTab('members');
    setShowSharePicker(false);
    setChatInput('');
    setProjectTracks(fetchProjectTracks(project.id));
    setMessages(fetchProjectMessages(project.id));
    fetchProjectMembers(project.id).then(members => {
      setViewMembers(members);
      setMembersLoading(false);
    });
    if (user) fetchUserTracks(user.id).then(setUserTracks);
  };

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (modalTab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, modalTab]);

  // ── Track sharing ─────────────────────────────────────────
  const handleShareTrack = (track) => {
    const next = addTrackToProject(viewProject.id, { ...track, sharedBy: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member' });
    setProjectTracks(next);
    setShowSharePicker(false);
  };

  const handleRemoveTrack = (trackId) => {
    const next = removeTrackFromProject(viewProject.id, trackId);
    setProjectTracks(next);
  };

  // ── Chat send ─────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const next = sendProjectMessage(viewProject.id, {
      text:         chatInput,
      senderName:   user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist',
      senderAvatar: user?.user_metadata?.avatar || '🎤',
    });
    setMessages(next);
    setChatInput('');
  };

  // ── JOIN ──────────────────────────────────────────────────
  const handleJoin = async (projectId) => {
    if (!user) { navigate('/login'); return; }
    const meta = user.user_metadata || {};
    const profile = {
      name:        meta.name        || user.email?.split('@')[0] || 'Artist',
      instruments: meta.instruments || '',
      genre:       meta.favoriteGenres || '',
      style:       meta.musicStyle  || '',
      location:    meta.location    || '',
      avatar:      meta.avatar_url  ? '📷' : '🎤',
      bio:         meta.bio         || meta.about || '',
      lookingFor:  meta.lookingFor  || '',
      phone:       meta.phone       || '',
      email:       typeof user.email === 'string' ? user.email : '',
      facebook:    meta.facebook    || '',
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, members: p.members + 1 } : p));
    setViewProject(prev => prev?.id === projectId ? { ...prev, members: (prev.members || 1) + 1 } : prev);
    setViewMembers(prev => [...prev, { ...profile, userId: user.id, joinedAt: new Date().toISOString(), isSelf: true }]);
    setSuccessMessage('You joined the project!');
    setViewProject(null);
    await joinProject(projectId, user.id, profile);
  };

  // ── Filter ────────────────────────────────────────────────
  const { matchedProjects, hasPreferences } = useMemo(() => {
    const applyGenreFilter = (list) =>
      genreFilter ? list.filter(p => p.genre.toLowerCase() === genreFilter.toLowerCase()) : list;

    if (!user) return { matchedProjects: applyGenreFilter(projects), hasPreferences: false };

    const userGenres      = user?.user_metadata?.favoriteGenres?.toLowerCase().split(',').map(g => g.trim()).filter(Boolean) || [];
    const userInstruments = user?.user_metadata?.instruments?.toLowerCase().split(',').map(i => i.trim()).filter(Boolean) || [];
    const userAgeRange    = parseAgeRange(user?.user_metadata?.connectAges);
    const hasPref = userGenres.length > 0 || userInstruments.length > 0 || Boolean(userAgeRange);

    if (!hasPref || showAll) return { matchedProjects: applyGenreFilter(projects), hasPreferences: hasPref };

    const filtered = projects.filter(p => {
      if (p.createdBy === user.id) return true;
      const gOk = !userGenres.length      || userGenres.some(g => p.genre.toLowerCase().includes(g) || g.includes(p.genre.toLowerCase()));
      const iOk = !userInstruments.length || userInstruments.some(ui => p.instruments.toLowerCase().includes(ui));
      const aOk = !userAgeRange           || rangeOverlap(userAgeRange, parseAgeRange(p.ageRange));
      return gOk && iOk && aOk;
    });

    return { matchedProjects: applyGenreFilter(filtered), hasPreferences: hasPref };
  }, [user, projects, showAll, genreFilter]);

  const isOwner = (project) => user && project.createdBy === user.id;

  // Projects the user created OR joined
  const userActiveProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter(p => {
      if (p.createdBy === user.id) return true;
      try {
        const members = JSON.parse(localStorage.getItem(`lizi_project_members_${p.id}`) || '[]');
        return members.some(m => m.userId === user.id);
      } catch { return false; }
    });
  }, [projects, user]);

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="page collab-page">
      <LocationDetector onCity={handleCityDetected} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="collab-hero">
        <div className="collab-eq-bars">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="collab-eq-bar" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        <h1 className="collab-hero-title">🎼 {t('collaboration.title')}</h1>
        <p className="collab-hero-sub">Find your next creative partner</p>
      </section>

      {/* ── Controls ──────────────────────────────────────── */}
      {user ? (
        <div className="collab-controls-bar">
          {/* Genre filter */}
          <div className="genre-filter-wrap">
            {genreFilter && (
              <span
                className="genre-filter-dot"
                style={{ background: genreColor(genreFilter) }}
              />
            )}
            <select
              className="genre-filter-dropdown"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={genreFilter ? {
                borderColor: genreColor(genreFilter),
                boxShadow: `0 0 0 1px ${genreColor(genreFilter)}44`,
                paddingLeft: '28px',
              } : {}}
            >
              <option value="">🎵 All Genres</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="collab-controls-right">
            {hasPreferences && (
              <button
                className={`collab-toggle-btn ${showAll ? 'active' : ''}`}
                onClick={() => setShowAll(v => !v)}
              >
                {showAll ? '🎯 Matched' : '🌐 All'}
              </button>
            )}
            <Link to="/profile" className="collab-profile-link">{t('collaboration.updateProfile')}</Link>
            <button
              className={`collab-rec-btn ${formOpen ? 'rec-cancel' : ''}`}
              onClick={formOpen ? closeForm : openNewForm}
            >
              <span className="rec-dot" />
              {formOpen ? 'Cancel' : t('collaboration.newProject')}
            </button>
          </div>
        </div>
      ) : (
        <div className="collab-login-prompt">
          <p>{t('collaboration.loginToCreateProject')}</p>
          <button className="collab-rec-btn" onClick={() => navigate('/login')}>
            <span className="rec-dot" />{t('collaboration.loginToCreate')}
          </button>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────── */}
      {successMessage && <div className="collab-toast">{successMessage}</div>}

      {/* ── Create / Edit form ────────────────────────────── */}
      {formOpen && (
        <section className="collab-studio-form">
          <div className="studio-form-header">
            <span className="studio-form-icon">🎛️</span>
            <h2>{editingProject ? '✏️ Edit Project' : t('collaboration.newProjectFormTitle')}</h2>
          </div>

          {formError && <div className="collab-form-error">{formError}</div>}

          <form onSubmit={handleSubmit} className="studio-form-grid">
            <label className="studio-field">
              <span className="studio-field-label">🎵 {t('collaboration.projectTitle')}</span>
              <input
                type="text"
                className="studio-input"
                value={formData.title}
                onChange={handleFieldChange('title')}
                placeholder={t('collaboration.projectTitle')}
              />
            </label>

            <label className="studio-field">
              <span className="studio-field-label">🎸 {t('collaboration.projectGenre')}</span>
              <div className="studio-select-wrap">
                <select
                  className="studio-input studio-select"
                  value={formData.genre}
                  onChange={handleFieldChange('genre')}
                  style={formData.genre ? {
                    borderColor: genreColor(formData.genre),
                    boxShadow: `0 0 0 1px ${genreColor(formData.genre)}44`,
                  } : {}}
                >
                  <option value="">{t('collaboration.projectGenre')}…</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {formData.genre && (
                  <span
                    className="studio-select-dot"
                    style={{ background: genreColor(formData.genre) }}
                  />
                )}
              </div>
            </label>

            <label className="studio-field">
              <span className="studio-field-label">🥁 {t('collaboration.projectInstruments')}</span>
              <div className="studio-select-wrap">
                <select
                  className="studio-input studio-select"
                  value={formData.instruments}
                  onChange={handleFieldChange('instruments')}
                  style={formData.instruments ? {
                    borderColor: 'var(--music-pink)',
                    boxShadow: '0 0 0 1px rgba(255,0,110,0.22)',
                  } : {}}
                >
                  <option value="">🥁 Choose instrument…</option>
                  {INSTRUMENTS.map(ins => <option key={ins} value={ins}>{ins}</option>)}
                </select>
                {formData.instruments && (
                  <span className="studio-select-dot" style={{ background: 'var(--music-pink)' }} />
                )}
              </div>
            </label>

            <label className="studio-field">
              <span className="studio-field-label">👤 {t('collaboration.projectAgeRange')}</span>
              <div className="studio-select-wrap">
                <select
                  className="studio-input studio-select"
                  value={formData.ageRange}
                  onChange={handleFieldChange('ageRange')}
                  style={formData.ageRange ? {
                    borderColor: 'var(--music-cyan)',
                    boxShadow: '0 0 0 1px rgba(0,217,255,0.25)',
                  } : {}}
                >
                  <option value="">{t('collaboration.projectAgeRange')}…</option>
                  {AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {formData.ageRange && (
                  <span className="studio-select-dot" style={{ background: 'var(--music-cyan)' }} />
                )}
              </div>
            </label>

            <label className="studio-field">
              <span className="studio-field-label">📍 Location</span>
              <div className="studio-select-wrap">
                <select
                  className="studio-input studio-select"
                  value={formData.location}
                  onChange={handleFieldChange('location')}
                  style={formData.location ? {
                    borderColor: 'var(--music-cyan)',
                    boxShadow: '0 0 0 1px rgba(0,217,255,0.25)',
                  } : {}}
                >
                  <option value="">📍 Choose location…</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {formData.location && (
                  <span className="studio-select-dot" style={{ background: 'var(--music-cyan)' }} />
                )}
              </div>
            </label>

            <label className="studio-field studio-field-full">
              <span className="studio-field-label">📝 {t('collaboration.projectDescription')}</span>
              <textarea
                className="studio-input studio-textarea"
                value={formData.description}
                onChange={handleFieldChange('description')}
                placeholder={t('collaboration.projectDescription')}
              />
            </label>

            <div className="studio-form-actions">
              <button type="button" className="studio-cancel-btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="collab-rec-btn">
                <span className="rec-dot" />
                {editingProject ? 'Save Changes' : t('collaboration.projectCreateButton')}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ── Project grid ──────────────────────────────────── */}
      {loading ? (
        <div className="collab-loading">
          <div className="collab-loading-bars">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="collab-loading-bar" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p>Loading projects…</p>
        </div>
      ) : matchedProjects.length === 0 ? (
        <div className="collab-empty">
          <span className="collab-empty-icon">🎵</span>
          <p>No projects match your preferences.</p>
          {hasPreferences && (
            <button className="collab-toggle-btn" onClick={() => setShowAll(true)}>
              🌐 Show all projects
            </button>
          )}
        </div>
      ) : (
        <div className="collab-album-grid">
          {matchedProjects.map((project) => {
            const color  = genreColor(project.genre);
            const heights = waveHeights(project.id);
            return (
              <div
                key={project.id}
                className={`collab-album-card ${isOwner(project) ? 'collab-album-owner' : ''}`}
                style={{ '--card-color': color }}
                onClick={() => openDetailModal(project)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openDetailModal(project)}
              >
                {/* Colored top stripe */}
                <div className="album-stripe" />

                {/* Top row */}
                <div className="album-top-row">
                  <span className="album-genre-chip">{project.genre || 'Music'}</span>
                  {isOwner(project) ? (
                    <div
                      className="project-kebab-wrap"
                      ref={el => { menuRefs.current[project.id] = el; }}
                    >
                      <button
                        className="kebab-btn"
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(id => id === project.id ? null : project.id); }}
                        aria-label="Project options"
                      >⋮</button>
                      {openMenuId === project.id && (
                        <div className="kebab-dropdown">
                          <button className="kebab-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); openDetailModal(project); }}>
                            👥 View Members
                          </button>
                          <button className="kebab-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); openEditForm(project); }}>
                            ✏️ Edit
                          </button>
                          <div className="kebab-divider" />
                          <button className="kebab-item kebab-item-danger" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeleteTarget(project); }}>
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="album-member-pill">
                      <span className="album-live-dot" />
                      {project.members || 1} {t('collaboration.members')}
                    </span>
                  )}
                </div>

                {/* Mini waveform */}
                <div className="album-waveform">
                  {heights.map((h, i) => (
                    <div
                      key={i}
                      className="album-wave-bar"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.06}s` }}
                    />
                  ))}
                </div>

                {/* Title */}
                <h3 className="album-title">{project.title}</h3>

                {/* Description */}
                {project.description && (
                  <p className="album-desc">{project.description}</p>
                )}

                {/* Info chips */}
                <div className="album-chips">
                  {project.instruments && <span className="album-chip">🎸 {project.instruments}</span>}
                  {project.ageRange    && <span className="album-chip">👤 {project.ageRange}</span>}
                  {project.location    && <span className="album-chip">📍 {project.location}</span>}
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
                </div>

                {/* Footer */}
                <div className="album-footer">
                  {isOwner(project) ? (
                    <span className="album-owner-badge">👑 Your Project</span>
                  ) : (
                    <button
                      className="album-join-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ▶ {t('collaboration.joinProject')}
                    </button>
                  )}
                  <button
                    className="album-view-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}`); }}
                    title="View project page"
                  >
                    👁 View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Active collaborations section ─────────────────── */}
      {user && (
        <section className="collab-active-section">
          <h2>{t('collaboration.activeCollaborations')}</h2>
          {userActiveProjects.length === 0 ? (
            <p>{t('collaboration.noCollaborations')}</p>
          ) : (
            <div className="active-projects-list">
              {userActiveProjects.map(p => (
                <div
                  key={p.id}
                  className="active-project-item"
                  style={{ '--apc': genreColor(p.genre) }}
                  onClick={() => navigate(`/project/${p.id}`)}
                >
                  <span className="active-project-dot" />
                  <span className="active-project-title">{p.title}</span>
                  <span className="active-project-genre">{p.genre}</span>
                  {p.createdBy === user.id && <span className="active-project-owner">👑</span>}
                  <span className="active-project-arrow">→</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Project detail modal ──────────────────────────── */}
      {viewProject && (() => {
        const isMember = isOwner(viewProject) || viewMembers.some(m => m.userId === user?.id);
        const color    = genreColor(viewProject.genre);
        return (
          <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && setViewProject(null)}>
            <div className="project-detail-modal">
              <button className="upload-close-btn" onClick={() => setViewProject(null)} aria-label="Close">✕</button>

              {/* Waveform header */}
              <div className="modal-waveform-header" style={{ '--modal-color': color }}>
                {waveHeights(viewProject.id, 20).map((h, i) => (
                  <div key={i} className="modal-wave-bar" style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>

              <div className="project-detail-icon">🎼</div>
              <h2 className="project-detail-title">{viewProject.title}</h2>

              <div className="project-detail-tags">
                {viewProject.genre    && <span className="detail-tag genre-tag-chip">{viewProject.genre}</span>}
                {viewProject.ageRange && <span className="detail-tag age-tag-chip">👤 Ages {viewProject.ageRange}</span>}
                {viewProject.location && <span className="detail-tag loc-tag-chip">📍 {viewProject.location}</span>}
              </div>

              <div className="project-detail-rows">
                {viewProject.instruments && (
                  <div className="detail-row">
                    <span className="detail-label">🎸 Instruments</span>
                    <span className="detail-value">{viewProject.instruments}</span>
                  </div>
                )}
                {viewProject.description && (
                  <div className="detail-row detail-description">
                    <span className="detail-label">📝 About</span>
                    <span className="detail-value">{viewProject.description}</span>
                  </div>
                )}
              </div>

              {/* ── Tabs (only for members/owner) ─────────── */}
              {isMember ? (
                <>
                  <div className="modal-tabs">
                    <button className={`modal-tab ${modalTab === 'members' ? 'active' : ''}`} onClick={() => setModalTab('members')}>
                      👥 Members <span className="tab-badge">{viewProject.members || 0}</span>
                    </button>
                    <button className={`modal-tab ${modalTab === 'tracks' ? 'active' : ''}`} onClick={() => setModalTab('tracks')}>
                      🎵 Tracks <span className="tab-badge">{projectTracks.length}</span>
                    </button>
                    <button className={`modal-tab ${modalTab === 'chat' ? 'active' : ''}`} onClick={() => setModalTab('chat')}>
                      💬 Chat <span className="tab-badge">{messages.length}</span>
                    </button>
                  </div>

                  {/* Members tab */}
                  {modalTab === 'members' && (
                    <div className="modal-tab-panel">
                      {membersLoading ? (
                        <p className="members-loading">Loading members…</p>
                      ) : viewMembers.length === 0 ? (
                        <p className="members-empty">No members yet.</p>
                      ) : (
                        <div className="members-list">
                          {viewMembers.map((member, i) => (
                            <div key={member.userId || i} className="member-profile-card">
                              <div className="mpc-header">
                                <div className="mpc-avatar">{member.avatar || '🎤'}</div>
                                <div className="mpc-top-info">
                                  <span className="mpc-name">{member.name}</span>
                                  {member.joinedAt && (
                                    <span className="mpc-joined">
                                      Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mpc-chips">
                                {member.genre      && <span className="mpc-chip mpc-chip-genre">{member.genre}</span>}
                                {member.style      && <span className="mpc-chip mpc-chip-style">{member.style}</span>}
                                {member.instruments && member.instruments.split(',').map(ins => (
                                  <span key={ins.trim()} className="mpc-chip mpc-chip-inst">🎸 {ins.trim()}</span>
                                ))}
                              </div>

                              {(member.bio || member.lookingFor) && (
                                <div className="mpc-bio">
                                  {member.bio && <p>{member.bio}</p>}
                                  {member.lookingFor && <p className="mpc-looking">🔍 Looking for: {member.lookingFor}</p>}
                                </div>
                              )}

                              {member.location && (
                                <p className="mpc-location">📍 {member.location}</p>
                              )}

                              <div className="mpc-contact">
                                {member.phone && (
                                  <button
                                    className="mpc-contact-btn mpc-whatsapp"
                                    onClick={() => {
                                      const phone = member.phone.replace(/\D/g, '');
                                      const msg = encodeURIComponent(`Hi ${member.name}! I'm on the "${viewProject.title}" project on LIZI 🎵`);
                                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                    }}
                                  >
                                    <span>📱</span> WhatsApp
                                  </button>
                                )}
                                {member.facebook && (
                                  <button
                                    className="mpc-contact-btn mpc-facebook"
                                    onClick={() => window.open(member.facebook, '_blank')}
                                  >
                                    <span>🔵</span> Facebook
                                  </button>
                                )}
                                {member.email && (
                                  <button
                                    className="mpc-contact-btn mpc-email"
                                    onClick={() => {
                                      const subject = encodeURIComponent(`LIZI Collaboration – ${viewProject.title}`);
                                      const body = encodeURIComponent(`Hi ${member.name},\n\nI found you through the "${viewProject.title}" project on LIZI. Let's collaborate! 🎵`);
                                      window.open(`mailto:${member.email}?subject=${subject}&body=${body}`);
                                    }}
                                  >
                                    <span>✉️</span> Email
                                  </button>
                                )}
                                {!member.phone && !member.facebook && !member.email && (
                                  <button
                                    className="mpc-contact-btn mpc-chat-tab"
                                    onClick={() => setModalTab('chat')}
                                  >
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

                  {/* Tracks tab */}
                  {modalTab === 'tracks' && (
                    <div className="modal-tab-panel">
                      {projectTracks.length === 0 ? (
                        <p className="members-empty">No tracks shared yet. Be the first!</p>
                      ) : (
                        <div className="project-track-list">
                          {projectTracks.map((track, i) => (
                            <div key={track.id || i} className="project-track-row">
                              <span className="project-track-num">{String(i + 1).padStart(2, '0')}</span>
                              <div className="project-track-info">
                                <span className="project-track-title">{track.title}</span>
                                <span className="project-track-meta">
                                  {track.genre && `${track.genre} · `}shared by {track.sharedBy || 'Member'}
                                </span>
                              </div>
                              {track.url ? (
                                <audio
                                  className="project-track-player"
                                  src={track.url}
                                  controls
                                  preload="none"
                                />
                              ) : (
                                <span className="project-track-no-audio">No audio</span>
                              )}
                              {(isOwner(viewProject) || track.sharedByUserId === user?.id) && (
                                <button
                                  className="project-track-remove"
                                  onClick={() => handleRemoveTrack(track.id)}
                                  title="Remove"
                                >✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Share picker */}
                      {!showSharePicker ? (
                        <button className="collab-rec-btn" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setShowSharePicker(true)}>
                          <span className="rec-dot" /> Share a Track
                        </button>
                      ) : (
                        <div className="share-picker">
                          <p className="share-picker-label">Pick a track from your library:</p>
                          {userTracks.length === 0 ? (
                            <p className="members-empty">You have no uploaded tracks yet.</p>
                          ) : (
                            <div className="share-picker-list">
                              {userTracks.map(track => (
                                <button
                                  key={track.id}
                                  className="share-picker-item"
                                  onClick={() => handleShareTrack(track)}
                                >
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

                  {/* Chat tab */}
                  {modalTab === 'chat' && (
                    <div className="modal-tab-panel chat-panel">
                      <div className="chat-messages">
                        {messages.length === 0 ? (
                          <p className="members-empty">No messages yet. Start the conversation!</p>
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
                      <form className="chat-input-row" onSubmit={handleSendMessage}>
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
                </>
              ) : (
                /* Non-member: show members list only */
                <div className="project-members-section">
                  <h4 className="project-members-title">👥 Members ({viewProject.members || 0})</h4>
                  {membersLoading ? (
                    <p className="members-loading">Loading members…</p>
                  ) : viewMembers.length === 0 ? (
                    <p className="members-empty">No members yet — be the first to join!</p>
                  ) : (
                    <div className="members-list">
                      {viewMembers.map((member, i) => (
                        <div key={member.userId || i} className="member-profile-card member-profile-card--preview">
                          <div className="mpc-header">
                            <div className="mpc-avatar">{member.avatar || '🎤'}</div>
                            <div className="mpc-top-info">
                              <span className="mpc-name">{member.name}</span>
                              {member.instruments && <span className="mpc-sub">🎸 {member.instruments}</span>}
                            </div>
                          </div>
                          {member.location && <p className="mpc-location">📍 {member.location}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="project-detail-actions">
                {isOwner(viewProject) ? (
                  <>
                    <button className="cancel-btn" onClick={() => setViewProject(null)}>Close</button>
                    <button className="track-edit-btn" style={{ flex: 1, padding: '10px 16px' }} onClick={() => { setViewProject(null); openEditForm(viewProject); }}>
                      ✏️ Edit
                    </button>
                    <button className="track-delete-btn" style={{ padding: '10px 14px' }} onClick={() => { setViewProject(null); setDeleteTarget(viewProject); }}>
                      🗑️
                    </button>
                  </>
                ) : user && isMember ? (
                  <button className="cancel-btn" style={{ width: '100%' }} onClick={() => setViewProject(null)}>Close</button>
                ) : user ? (
                  <>
                    <button className="cancel-btn" onClick={() => setViewProject(null)}>Maybe later</button>
                    <button className="join-btn join-btn-large" onClick={() => handleJoin(viewProject.id)}>
                      ✅ {t('collaboration.joinProject')}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="cancel-btn" onClick={() => setViewProject(null)}>Cancel</button>
                    <button className="join-btn join-btn-large" onClick={() => navigate('/login')}>Login to Join</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete confirmation ───────────────────────────── */}
      {deleteTarget && (
        <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="delete-dialog">
            <h3>🗑️ Delete this project?</h3>
            <p className="delete-track-name">"{deleteTarget.title}"</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="upload-actions">
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collaboration;
