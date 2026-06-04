import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Memorial() {
  const { t } = useLanguage();

  return (
    <div className="page memorial-page">
      <div className="memorial-container">
        <section className="memorial-header-section">
          <h1>{t('memorial.title')}</h1>
          <div className="tribute-accent-line"></div>
          <p className="memorial-subtitle">{t('memorial.subtitle')}</p>
        </section>

        <section className="memorial-card-section">
          <h2>{t('memorial.whoWasLiziTitle')}</h2>
          <div className="text-content">
            <p>{t('memorial.whoWasLiziP1')}</p>
            <p>{t('memorial.whoWasLiziP2')}</p>
            <p>{t('memorial.whoWasLiziP3')}</p>
            <p>{t('memorial.whoWasLiziP4')}</p>
            <p>{t('memorial.whoWasLiziP5')}</p>
          </div>
        </section>

        <section className="memorial-card-section">
          <h2>{t('memorial.establishmentTitle')}</h2>
          <div className="text-content">
            <p>{t('memorial.establishmentP1')}</p>
            <p>{t('memorial.establishmentP2')}</p>
          </div>
          
          <div className="tribute-quote-box">
            <p className="quote-text">“{t('memorial.memoryBlessed')}”</p>
          </div>
        </section>

        <section className="memorial-card-section song-section">
          <h2>{t('memorial.commemorativeSong')}</h2>
          <p className="song-desc">{t('memorial.commemorativeSongDesc')}</p>
          <div className="video-wrapper">
            <iframe 
              width="100%" 
              height="450" 
              src="https://www.youtube.com/embed/BruIGjQ554U" 
              title="שיר לזכרה של ליזי"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen>
            </iframe>
          </div>
        </section>

        <div className="memorial-actions">
          <Link to="/" className="back-btn">{t('memorial.backHome')}</Link>
        </div>
      </div>
    </div>
  );
}

export default Memorial;
