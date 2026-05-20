import React from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function OpenStage() {
  const { t } = useLanguage();

  const artists = [
    { id: 1, name: 'Luna Dreams', genre: 'Electronic', followers: 1200 },
    { id: 2, name: 'Jazz Master', genre: 'Jazz', followers: 890 },
    { id: 3, name: 'Beat Maker', genre: 'Hip-Hop', followers: 2100 },
    { id: 4, name: 'Indie Rock', genre: 'Rock', followers: 756 },
    { id: 5, name: 'Pop Star', genre: 'Pop', followers: 3400 },
    { id: 6, name: 'Folk Singer', genre: 'Folk', followers: 450 },
  ];

  return (
    <div className="page open-stage-page">
      <h1>{t('openStage.title')}</h1>
      <p className="subtitle">{t('openStage.subtitle')}</p>

      <div className="filters">
        <button className="filter-btn active">{t('openStage.allGenres')}</button>
        <button className="filter-btn">Electronic</button>
        <button className="filter-btn">Jazz</button>
        <button className="filter-btn">Hip-Hop</button>
        <button className="filter-btn">Rock</button>
      </div>

      <div className="artists-grid">
        {artists.map((artist) => (
          <div key={artist.id} className="artist-card">
            <div className="artist-avatar">🎤</div>
            <h3>{artist.name}</h3>
            <p className="genre-tag">{artist.genre}</p>
            <div className="followers">👥 {artist.followers} {t('openStage.followers')}</div>
            <button className="listen-btn">{t('openStage.listenNow')}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OpenStage;
