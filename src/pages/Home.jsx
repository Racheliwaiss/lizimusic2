import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import bandImg from '../../band.png';
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
        <div className="hero-band-wrap">
          <img src={bandImg} alt="band" className="hero-band-img" />
          <div className="band-overlay-grade" />
          <div className="band-overlay-warm" />
          <div className="band-overlay-vignette" />
        </div>
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

      <section className="home-highlights">
        <div className="highlight-card">
          <div className="highlight-icon">🥁</div>
          <h3>{t('nav.findBandmate')}</h3>
          <p>{t('bandmate.subtitle')}</p>
          <ul className="highlight-menu">
            <li><Link to="/find-bandmate">🎼 {t('nav.bandmateMenu.browseListings')}</Link></li>
            <li><Link to="/find-bandmate">📋 {t('nav.bandmateMenu.postListing')}</Link></li>
            <li><Link to="/search">🔍 {t('nav.bandmateMenu.searchMusicians')}</Link></li>
          </ul>
        </div>

        <div className="highlight-card">
          <div className="highlight-icon">🎼</div>
          <h3>{t('nav.collaborate')}</h3>
          <p>{t('collaboration.title')}</p>
          <ul className="highlight-menu">
            <li><Link to="/collaboration">🗂️ {t('nav.collaborateMenu.browseProjects')}</Link></li>
            <li><Link to="/collaboration">➕ {t('nav.collaborateMenu.createProject')}</Link></li>
            <li><Link to="/profile">👤 {t('nav.collaborateMenu.myProjects')}</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Home;
