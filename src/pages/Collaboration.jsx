import React, { useMemo } from 'react';
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
  const { t } = useLanguage();
  const { user } = useAuth();

  // Filter projects based on user interests
  const filteredProjects = useMemo(() => {
    if (!user) return allProjects;
    if (!user) return allProjects;

    const userGenres = user?.user_metadata?.favoriteGenres?.toLowerCase().split(',').map(g => g.trim()) || [];
    const userInstruments = user?.user_metadata?.instruments?.toLowerCase().split(',').map(i => i.trim()) || [];
    const userAgeRange = user?.user_metadata?.connectAges?.toLowerCase() || '';

    return allProjects.filter(project => {
      // If user has no preferences, show all
      if (userGenres.length === 0 && userInstruments.length === 0 && !userAgeRange) {
        return true;
      }

      // Check genre match
      const genreMatch = userGenres.length === 0 || userGenres.some(g => project.genre.toLowerCase().includes(g) || g.includes(project.genre.toLowerCase()));

      // Check instrument match
      const instrumentMatch = userInstruments.length === 0 || userInstruments.some(ui => project.instruments.toLowerCase().includes(ui) || ui.split(' ').some(word => project.instruments.toLowerCase().includes(word)));

      // Check age range match (simplified - just check if user's preference overlaps)
      const ageMatch = !userAgeRange || userAgeRange.includes(project.ageRange) || project.ageRange.includes(userAgeRange);

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
      <button className="new-project-btn">{t('collaboration.newProject')}</button>

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
