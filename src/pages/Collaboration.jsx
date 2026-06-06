import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchProjects, createProject, updateProject, deleteProject, joinProject } from '../lib/db';
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
  const [formError, setFormError]           = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAll, setShowAll]               = useState(false); // bypass preference filter

  useEffect(() => {
    fetchProjects().then((data) => { setProjects(data); setLoading(false); });
  }, []);

  // Auto-clear success message after 3 s
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(t);
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
    if (!title.trim() || !genre.trim() || !instruments.trim() || !ageRange.trim()) {
      setFormError('Please fill in title, genre, instruments, and age range.');
      return;
    }

    const fields = {
      title:       title.trim(),
      genre:       genre.trim(),
      instruments: instruments.trim(),
      ageRange:    ageRange.trim(),
      description: description.trim() || 'A fresh collaboration idea waiting for artists.',
    };

    if (editingProject) {
      const { error } = await updateProject(editingProject.id, fields);
      if (error) { setFormError(`Could not save: ${error}`); return; }
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...fields } : p));
      setSuccessMessage('Project updated.');
    } else {
      const { project, error } = await createProject(fields, user?.id);
      const saved = project
        ? { ...project, createdBy: user?.id }
        : { id: Date.now(), ...fields, members: 1, createdBy: user?.id };
      // If Supabase errored but we have no project row, just add locally
      setProjects(prev => [saved, ...prev]);
      setSuccessMessage('Project added to the collaboration board.');
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

  // ── JOIN ──────────────────────────────────────────────────
  const handleJoin = async (projectId) => {
    if (!user) { navigate('/login'); return; }
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, members: p.members + 1 } : p));
    setSuccessMessage('You joined the project!');
    await joinProject(projectId);
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
              <div key={project.id} className={`project-card ${isOwner(project) ? 'owner-card' : ''}`}>
                {isOwner(project) && <div className="owner-badge">Your project</div>}
                <div className="project-thumbnail">🎼</div>
                <h3>{project.title}</h3>
                <p className="genre">{project.genre}</p>
                <p className="instruments">🎸 {project.instruments}</p>
                {project.ageRange && <p className="age-range">👥 Ages: {project.ageRange}</p>}
                <p className="description">{project.description}</p>
                <div className="members">
                  <span>{project.members} {t('collaboration.members')}</span>
                </div>

                {isOwner(project) ? (
                  <div className="project-owner-actions">
                    <button className="track-edit-btn" onClick={() => openEditForm(project)}>✏️ Edit</button>
                    <button className="track-delete-btn" onClick={() => setDeleteTarget(project)}>🗑️</button>
                  </div>
                ) : (
                  <button className="join-btn" onClick={() => handleJoin(project.id)}>
                    {t('collaboration.joinProject')}
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
