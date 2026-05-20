import React from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Collaboration() {
  const { t } = useLanguage();

  const projects = [
    { id: 1, title: 'Summer Vibes EP', genre: 'Electronic', members: 3 },
    { id: 2, title: 'Jazz Sessions', genre: 'Jazz', members: 2 },
    { id: 3, title: 'Hip-Hop Beats', genre: 'Hip-Hop', members: 4 },
  ];

  return (
    <div className="page collaboration-page">
      <h1>{t('collaboration.title')}</h1>
      <button className="new-project-btn">{t('collaboration.newProject')}</button>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-thumbnail">🎼</div>
            <h3>{project.title}</h3>
            <p className="genre">{project.genre}</p>
            <div className="members">
              <span>👥 {project.members} {t('collaboration.members')}</span>
            </div>
            <button className="join-btn">{t('collaboration.joinProject')}</button>
          </div>
        ))}
      </div>

      <section className="active-collaborations">
        <h2>{t('collaboration.activeCollaborations')}</h2>
        <p>{t('collaboration.noCollaborations')}</p>
      </section>
    </div>
  );
}

export default Collaboration;
