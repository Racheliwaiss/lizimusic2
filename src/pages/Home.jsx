import React from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Home() {
  const { t } = useLanguage();

  return (
    <div className="page home-page">
      <section className="hero">
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
        <button className="cta-button">{t('home.cta')}</button>
      </section>
      
      <section className="features">
        <h2>{t('home.whyLizi')}</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>{t('home.features.collaborate')}</h3>
            <p>{t('home.features.collaborateDesc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('home.features.discover')}</h3>
            <p>{t('home.features.discoverDesc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('home.features.connect')}</h3>
            <p>{t('home.features.connectDesc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('home.features.share')}</h3>
            <p>{t('home.features.shareDesc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
