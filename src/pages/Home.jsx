import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

function Home() {
  const { t } = useLanguage();

  const { user } = useAuth();

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
        {user ? (
          <Link to="/profile" className="cta-button">{t('home.ctaLogged')}</Link>
        ) : (
          <Link to="/login" className="cta-button">{t('home.cta')}</Link>
        )}
        <div className="hero-sound-bars reverse">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </section>
      {user && (
        <section className="logged-actions">
          <h2>{t('home.quickActions')}</h2>
          <div className="actions-row">
            <Link to="/profile" className="action-btn">✏️ {t('home.actions.createProfile')}</Link>
            <Link to="/open-stage" className="action-btn">🎵 {t('home.actions.seeMusic')}</Link>
            <Link to="/messages" className="action-btn">💬 {t('home.actions.messages')}</Link>
          </div>
        </section>
      )}

      <section className="features">
        <h2>{t('home.whyLizi')}</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>{t('home.features.collaborate')}</h3>
            <p>{t('home.features.collaborateDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎵</div>
            <h3>{t('home.features.discover')}</h3>
            <p>{t('home.features.discoverDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>{t('home.features.connect')}</h3>
            <p>{t('home.features.connectDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎧</div>
            <h3>{t('home.features.share')}</h3>
            <p>{t('home.features.shareDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
