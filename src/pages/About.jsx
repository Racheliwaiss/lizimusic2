import React from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function About() {
  const { t } = useLanguage();

  return (
    <div className="page about-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>{t('about.title')}</h1>
        <p>{t('about.subtitle')}</p>
      </section>

      <section className="about-section music-stats">
        <div className="music-note-decoration">🎵</div>
        <h2>{t('about.mission')}</h2>
        <p>{t('about.missionDesc')}</p>
      </section>

      <section className="about-section music-stats">
        <div className="music-note-decoration">🎶</div>
        <h2>{t('about.vision')}</h2>
        <p>{t('about.visionDesc')}</p>
      </section>

      <section className="values-section">
        <h2>{t('about.values')}</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🎨</div>
            <h3>{t('about.creativity')}</h3>
            <p>{t('about.creativetyDesc')}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">👥</div>
            <h3>{t('about.community')}</h3>
            <p>{t('about.communityDesc')}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌍</div>
            <h3>{t('about.accessibility')}</h3>
            <p>{t('about.accessibilityDesc')}</p>
          </div>
          <div className="value-card">
            <div className="value-icon">⚡</div>
            <h3>{t('about.innovation')}</h3>
            <p>{t('about.innovationDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
