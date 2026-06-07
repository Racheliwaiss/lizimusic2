import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchProjects, createProject, updateProject, deleteProject, joinProject, fetchProjectMembers } from '../lib/db';
import './Pages.css';

const EMPTY_FORM = { title: '', genre: '', instruments: '', ageRange: '', location: '', description: '' };

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
  const [viewProject, setViewProject]       = useState(null);  // detail modal
  const [viewMembers, setViewMembers]       = useState([]);    // members of viewed project
  const [membersLoading, setMembersLoading] = useState(false);
  const [formError, setFormError]           = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAll, setShowAll]               = useState(false);

  useEffect(() => {
    fetchProjects().then((data) => { setProjects(data); setLoading(false); });
  }, []);

  // Auto-clear success message after 3 s
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
      if (createErr && !project) {
        console.warn('createProject Supabase error (local fallback):', createErr);
      }
      const saved = project
        ? { ...project, createdBy: user?.id }
        : { id: Date.now(), ...fields, members: 1, createdBy: user?.id };
      setProjects(prev => [saved, ...prev]);

      // Auto-register the creator as the first member so they appear in the members list
      const creatorProfile = {
        name:        user?.user_metadata?.name || user?.email?.split('@')[0] || 'Creator',
        instruments: user?.user_metadata?.instruments || '',
        genre:       user?.user_metadata?.favoriteGenres || '',
        location:    user?.user_metadata?.location || '',
        avatar:      '👑',
      };
      await joinProject(saved.id, user?.id, creatorProfile);

      setSuccessMessage('Project created! You are now connected as the first member.');
    }

    closeForm();
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteProject(deleteTarget.id);
    if (error) { setSuccessMessage(''); setFormError(`Delete failed: ${error}`); setDeleteTarget(null); return; }
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    setSuccessMessage('Project deleted.');
  };

  // ── Open detail modal + fetch members ────────────────────
  const openDetailModal = (project) => {
    setViewProject(project);
    setViewMembers([]);
    setMembersLoading(true);
    fetchProjectMembers(project.id).then(members => {
      setViewMembers(members);
      setMembersLoading(false);
    });
  };

  // ── JOIN ──────────────────────────────────────────────────
  const handleJoin = async (projectId) => {
    if (!user) { navigate('/login'); return; }

    // Build the profile snapshot to store with membership
    const profile = {
      name:        user.user_metadata?.name || user.email?.split('@')[0] || 'Artist',
      instruments: user.user_metadata?.instruments || '',
      genre:       user.user_metadata?.favoriteGenres || '',
      location:    user.user_metadata?.location || '',
      avatar:      user.user_metadata?.avatar_url ? '📷' : '🎤',
    };

    // Optimistic UI update
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, members: p.members + 1 } : p));
    setViewProject(prev => prev?.id === projectId ? { ...prev, members: (prev.members || 1) + 1 } : prev);
    // Add the joining user to the local members list immediately
    setViewMembers(prev => [...prev, { ...profile, userId: user.id, joinedAt: new Date().toISOString() }]);

    setSuccessMessage('You joined the project!');
    setViewProject(null);
    await joinProject(projectId, user.id, profile);
  };

  // ── Filter ────────────────────────────────────────────────
  const { matchedProjects, hasPreferences } = useMemo(() => {
    if (!user) return { matchedProjects: projects, hasPreferences: false };

    const userGenres      = user?.user_metadata?.favoriteGenres?.toLowerCase().split(',').map(g => g.trim()).filter(Boolean) || [];
    const userInstruments = user?.user_metadata?.instruments?.toLowerCase().split(',').map(i => i.trim()).filter(Boolean) || [];
    const userAgeRange    = parseAgeRange(user?.user_metadata?.connectAges);
    const hasPref = userGenres.length > 0 || userInstruments.length > 0 || Boolean(userAgeRange);

    if (!hasPref || showAll) return { matchedProjects: projects, hasPreferences: hasPref };

    const filtered = projects.filter(p => {
      if (p.createdBy === user.id) return true;                          // always show own
      const gOk = !userGenres.length      || userGenres.some(g => p.genre.toLowerCase().includes(g) || g.includes(p.genre.toLowerCase()));
      const iOk = !userInstruments.length || userInstruments.some(ui => p.instruments.toLowerCase().includes(ui));
      const aOk = !userAgeRange           || rangeOverlap(userAgeRange, parseAgeRange(p.ageRange));
      return gOk && iOk && aOk;
    });

    return { matchedProjects: filtered, hasPreferences: hasPref };
  }, [user, projects, showAll]);

  const isOwner = (project) => user && project.createdBy === user.id;

  // ── New-Project button label ──────────────────────────────
  const newBtnLabel = () => {
    if (!formOpen) return t('collaboration.newProject');
    if (editingProject) return '✕ Cancel edit';
    return t('collaboration.cancelNewProject');
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="page collaboration-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div><div className="bar"></div>
          <div className="bar"></div><div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>🎼 {t('collaboration.title')}</h1>
      </section>

      {user ? (
        <>
          <button className="new-project-btn" onClick={formOpen ? closeForm : openNewForm}>
            {newBtnLabel()}
          </button>

          {successMessage && <div className="form-success">{successMessage}</div>}

          {formOpen && (
            <section className="new-project-form">
              <h2>{editingProject ? '✏️ Edit Project' : t('collaboration.newProjectFormTitle')}</h2>
              {formError && <div className="form-error">{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label>
                    {t('collaboration.projectTitle')}
                    <input type="text" className="form-input" value={formData.title}       onChange={handleFieldChange('title')}       placeholder={t('collaboration.projectTitle')} />
                  </label>
                  <label>
                    {t('collaboration.projectGenre')}
                    <input type="text" className="form-input" value={formData.genre}       onChange={handleFieldChange('genre')}       placeholder={t('collaboration.projectGenre')} />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    {t('collaboration.projectInstruments')}
                    <input type="text" className="form-input" value={formData.instruments} onChange={handleFieldChange('instruments')} placeholder={t('collaboration.projectInstruments')} />
                  </label>
                  <label>
                    {t('collaboration.projectAgeRange')}
                    <input type="text" className="form-input" value={formData.ageRange}    onChange={handleFieldChange('ageRange')}    placeholder={t('collaboration.projectAgeRange')} />
                  </label>
                </div>
                <div className="form-row">
                  <label className="full-width">
                    📍 Location
                    <input type="text" className="form-input" value={formData.location} onChange={handleFieldChange('location')} placeholder="e.g. Tel Aviv, Remote, Online…" />
                  </label>
                </div>
                <div className="form-row">
                  <label className="full-width">
                    {t('collaboration.projectDescription')}
                    <textarea className="form-input" value={formData.description} onChange={handleFieldChange('description')} placeholder={t('collaboration.projectDescription')} />
                  </label>
                </div>
                <div className="project-form-actions">
                  <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="new-project-btn">
                    {editingProject ? 'Save Changes' : t('collaboration.projectCreateButton')}
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="collab-filter-bar">
            <p className="suggested-label">{t('collaboration.suggestedForYou')}</p>
            <div className="collab-filter-controls">
              {hasPreferences && (
                <button
                  className={`filter-toggle-btn ${showAll ? 'active' : ''}`}
                  onClick={() => setShowAll(v => !v)}
                >
                  {showAll ? '🎯 Show matched' : '🌐 Show all'}
                </button>
              )}
              <Link to="/profile" className="profile-action-btn">{t('collaboration.updateProfile')}</Link>
            </div>
          </div>
        </>
      ) : (
        <div className="login-prompt">
          <p>{t('collaboration.loginToCreateProject')}</p>
          <button className="new-project-btn" onClick={() => navigate('/login')}>{t('collaboration.loginToCreate')}</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading projects…</div>
      ) : (
        <div className="projects-grid">
          {matchedProjects.length > 0 ? (
            matchedProjects.map((project) => (
              <div
                key={project.id}
                className={`project-card ${isOwner(project) ? 'owner-card' : 'clickable-card'}`}
                onClick={() => !isOwner(project) && openDetailModal(project)}
                role={!isOwner(project) ? 'button' : undefined}
                tabIndex={!isOwner(project) ? 0 : undefined}
                onKeyDown={(e) => !isOwner(project) && e.key === 'Enter' && openDetailModal(project)}
              >
                {isOwner(project) && <div className="owner-badge">Your project</div>}
                <div className="project-thumbnail">🎼</div>
                <h3>{project.title}</h3>
                <p className="genre">{project.genre}</p>
                <p className="instruments">🎸 {project.instruments}</p>
                {project.ageRange && <p className="age-range">👥 Ages: {project.ageRange}</p>}
                {project.location && <p className="project-location">📍 {project.location}</p>}
                <p className="description">{project.description}</p>
                <div className="members">
                  <span>👤 {project.members} {t('collaboration.members')}</span>
                </div>

                {isOwner(project) ? (
                  <div className="project-owner-actions">
                    <button className="track-edit-btn" onClick={(e) => { e.stopPropagation(); openEditForm(project); }}>✏️ Edit</button>
                    <button className="track-delete-btn" onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}>🗑️</button>
                  </div>
                ) : (
                  <button
                    className="join-btn"
                    onClick={(e) => { e.stopPropagation(); openDetailModal(project); }}
                  >
                    {t('collaboration.joinProject')} →
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="no-results-block">
              <p className="no-results">No projects match your preferences.</p>
              {hasPreferences && (
                <button className="filter-toggle-btn" onClick={() => setShowAll(true)}>
                  🌐 Show all projects
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <section className="active-collaborations">
        <h2>{t('collaboration.activeCollaborations')}</h2>
        <p>{t('collaboration.noCollaborations')}</p>
      </section>

      {/* ── Project detail modal ─────────────────────────── */}
      {viewProject && (
        <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && setViewProject(null)}>
          <div className="project-detail-modal">
            <button className="upload-close-btn" onClick={() => setViewProject(null)} aria-label="Close">✕</button>

            <div className="project-detail-icon">🎼</div>
            <h2 className="project-detail-title">{viewProject.title}</h2>

            <div className="project-detail-tags">
              {viewProject.genre    && <span className="detail-tag genre-tag-chip">{viewProject.genre}</span>}
              {viewProject.ageRange && <span className="detail-tag age-tag-chip">👥 Ages {viewProject.ageRange}</span>}
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

            {/* ── Members list ─────────────────────────────── */}
            <div className="project-members-section">
              <h4 className="project-members-title">
                👥 Members ({viewProject.members || 0})
              </h4>

              {membersLoading ? (
                <p className="members-loading">Loading members…</p>
              ) : viewMembers.length === 0 ? (
                <p className="members-empty">No members yet — be the first to join!</p>
              ) : (
                <div className="members-list">
                  {viewMembers.map((member, i) => (
                    <div key={member.userId || i} className="member-card">
                      <div className="member-avatar">{member.avatar || '🎤'}</div>
                      <div className="member-info">
                        <p className="member-name">{member.name}</p>
                        {member.instruments && <p className="member-instruments">🎸 {member.instruments}</p>}
                        {member.genre       && <p className="member-genre">{member.genre}</p>}
                        {member.location    && <p className="member-location">📍 {member.location}</p>}
                      </div>
                      <button
                        className="member-connect-btn"
                        onClick={() => {
                          const msg = encodeURIComponent(`Hi ${member.name}, I found you on LIZI! Let's collaborate on "${viewProject.title}" 🎵`);
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }}
                        title="Connect via WhatsApp"
                      >
                        💬
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="project-detail-actions">
              <button className="cancel-btn" onClick={() => setViewProject(null)}>
                Maybe later
              </button>
              {user ? (
                <button className="join-btn join-btn-large" onClick={() => handleJoin(viewProject.id)}>
                  ✅ {t('collaboration.joinProject')}
                </button>
              ) : (
                <button className="join-btn join-btn-large" onClick={() => navigate('/login')}>
                  Login to Join
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
