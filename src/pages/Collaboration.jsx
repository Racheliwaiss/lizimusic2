import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

const allProjects = [
  { id: 1, title: 'Summer Vibes EP', genre: 'Electronic', instruments: 'Synth, Drums', ageRange: '18-35', members: 3, description: 'Upbeat summer electronic project' },
  { id: 2, title: 'Jazz Sessions', genre: 'Jazz', instruments: 'Piano, Bass, Drums', ageRange: '25-50', members: 2, description: 'Sophisticated jazz collaboration' },
  { id: 3, title: 'Hip-Hop Beats', genre: 'Hip-Hop', instruments: 'Beats, Rap, Production', ageRange: '18-40', members: 4, description: 'Urban hip-hop beat crafting' },
  { id: 4, title: 'Indie Folk Nights', genre: 'Folk', instruments: 'Guitar, Vocals, Percussion', ageRange: '20-45', members: 2, description: 'Acoustic folk storytelling' },
  { id: 5, title: 'Pop Collaboration', genre: 'Pop', instruments: 'Vocals, Keys, Production', ageRange: '16-35', members: 5, description: 'Chart-ready pop tracks' },
  { id: 6, title: 'Rock Anthem', genre: 'Rock', instruments: 'Guitar, Bass, Drums, Vocals', ageRange: '18-50', members: 4, description: 'High-energy rock production' },
  { id: 7, title: 'R&B Vibes', genre: 'R&B', instruments: 'Vocals, Keys, Production', ageRange: '20-40', members: 3, description: 'Smooth R&B collaboration' },
  { id: 8, title: 'Classical Orchestra', genre: 'Classical', instruments: 'Strings, Woodwinds, Brass', ageRange: '25-60', members: 8, description: 'Symphony composition project' },
];

function Collaboration() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState(allProjects);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    genre: '',
    instruments: '',
    ageRange: '',
    description: '',
  });
  const [createError, setCreateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleNewProjectChange = (field) => (event) => {
    setNewProjectData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateProject = (event) => {
    event.preventDefault();
    setCreateError('');
    setSuccessMessage('');

    const { title, genre, instruments, ageRange, description } = newProjectData;
    if (!title.trim() || !genre.trim() || !instruments.trim() || !ageRange.trim()) {
      setCreateError('Please fill in the title, genre, instruments, and age range.');
      return;
    }

    const nextId = Math.max(...projects.map((project) => project.id), 0) + 1;
    const newProject = {
      id: nextId,
      title: title.trim(),
      genre: genre.trim(),
      instruments: instruments.trim(),
      ageRange: ageRange.trim(),
      members: 1,
      description: description.trim() || 'A fresh collaboration idea waiting for artists.',
    };

    setProjects([newProject, ...projects]);
    setNewProjectData({
      title: '',
      genre: '',
      instruments: '',
      ageRange: '',
      description: '',
    });
    setSuccessMessage('Project added to the collaboration board.');
  };

  const parseAgeRange = (range) => {
    const normalized = String(range || '').trim();
    if (!normalized) return null;

    const plusMatch = normalized.match(/^(\d+)\+$/);
    if (plusMatch) {
      return { min: Number(plusMatch[1]), max: Infinity };
    }

    const betweenMatch = normalized.match(/^(\d+)[^\d]+(\d+)$/);
    if (betweenMatch) {
      return { min: Number(betweenMatch[1]), max: Number(betweenMatch[2]) };
    }

    const single = Number(normalized.replace(/[^0-9]/g, ''));
    if (!Number.isNaN(single)) {
      return { min: single, max: single };
    }

    return null;
  };

  const rangeOverlap = (a, b) => {
    if (!a || !b) return false;
    return a.min <= b.max && b.min <= a.max;
  };

  const filteredProjects = useMemo(() => {
    if (!user) return projects;

    const userGenres = user?.user_metadata?.favoriteGenres?.toLowerCase().split(',').map(g => g.trim()).filter(Boolean) || [];
    const userInstruments = user?.user_metadata?.instruments?.toLowerCase().split(',').map(i => i.trim()).filter(Boolean) || [];
    const userAgeRange = parseAgeRange(user?.user_metadata?.connectAges);

    if (userGenres.length === 0 && userInstruments.length === 0 && !userAgeRange) {
      return allProjects;
    }

    return projects.filter(project => {
      const genreMatch = userGenres.length === 0 || userGenres.some(g => project.genre.toLowerCase().includes(g) || g.includes(project.genre.toLowerCase()));
      const instrumentMatch = userInstruments.length === 0 || userInstruments.some(ui => project.instruments.toLowerCase().includes(ui));
      const ageMatch = !userAgeRange || rangeOverlap(userAgeRange, parseAgeRange(project.ageRange));

      return genreMatch && instrumentMatch && ageMatch;
    });
  }, [user]);
  return (
    <div className="page collaboration-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>🎼 {t('collaboration.title')}</h1>
        {user && (
          <p className="filter-hint">Showing projects matched to your interests</p>
        )}
      </section>
      {user ? (
        <>
          <button
            className="new-project-btn"
            onClick={() => {
              setNewProjectOpen((prev) => !prev);
              setCreateError('');
              setSuccessMessage('');
            }}
          >
            {newProjectOpen ? t('collaboration.cancelNewProject') : t('collaboration.newProject')}
          </button>

          {newProjectOpen && (
            <section className="new-project-form">
          <h2>{t('collaboration.newProjectFormTitle')}</h2>
          {createError && <div className="form-error">{createError}</div>}
          {successMessage && <div className="form-success">{successMessage}</div>}
          <form onSubmit={handleCreateProject}>
            <div className="form-row">
              <label>
                {t('collaboration.projectTitle')}
                <input
                  type="text"
                  className="form-input"
                  value={newProjectData.title}
                  onChange={handleNewProjectChange('title')}
                  placeholder={t('collaboration.projectTitle')}
                />
              </label>
              <label>
                {t('collaboration.projectGenre')}
                <input
                  type="text"
                  className="form-input"
                  value={newProjectData.genre}
                  onChange={handleNewProjectChange('genre')}
                  placeholder={t('collaboration.projectGenre')}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                {t('collaboration.projectInstruments')}
                <input
                  type="text"
                  className="form-input"
                  value={newProjectData.instruments}
                  onChange={handleNewProjectChange('instruments')}
                  placeholder={t('collaboration.projectInstruments')}
                />
              </label>
              <label>
                {t('collaboration.projectAgeRange')}
                <input
                  type="text"
                  className="form-input"
                  value={newProjectData.ageRange}
                  onChange={handleNewProjectChange('ageRange')}
                  placeholder={t('collaboration.projectAgeRange')}
                />
              </label>
            </div>
            <div className="form-row">
              <label className="full-width">
                {t('collaboration.projectDescription')}
                <textarea
                  className="form-input"
                  value={newProjectData.description}
                  onChange={handleNewProjectChange('description')}
                  placeholder={t('collaboration.projectDescription')}
                />
              </label>
            </div>
            <div className="project-form-actions">
              <button type="submit" className="new-project-btn">
                {t('collaboration.projectCreateButton')}
              </button>
            </div>
          </form>
        </section>
      )}
      {user && (
        <>
          <p className="suggested-label">{t('collaboration.suggestedForYou')}</p>
          <Link to="/profile" className="profile-action-btn">
            {t('collaboration.updateProfile')}
          </Link>
        </>
      )}
      {!user && (
        <div className="login-prompt">
          <p>{t('collaboration.loginToCreateProject')}</p>
          <button className="new-project-btn" onClick={() => navigate('/login')}>
            {t('collaboration.loginToCreate')}
          </button>
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-thumbnail">🎼</div>
              <h3>{project.title}</h3>
              <p className="genre">{project.genre}</p>
              <p className="instruments">🎸 {project.instruments}</p>
              <p className="age-range">👥 Ages: {project.ageRange}</p>
              <p className="description">{project.description}</p>
              <div className="members">
                <span>{project.members} {t('collaboration.members')}</span>
              </div>
              <button className="join-btn">{t('collaboration.joinProject')}</button>
            </div>
          ))
        ) : (
          <p className="no-results">No projects match your preferences. Browse all projects or update your profile.</p>
        )}
      </div>

      <section className="active-collaborations">
        <h2>{t('collaboration.activeCollaborations')}</h2>
        <p>{t('collaboration.noCollaborations')}</p>
      </section>
    </div>
  );
}

export default Collaboration;
