import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { fetchArtists } from '../lib/db';
import './Pages.css';

function Search() {
  const [query, setQuery] = useState('');
  const [followed, setFollowed] = useState(new Set());
  const [allArtists, setAllArtists] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetchArtists().then(setAllArtists);
  }, []);

  const toggleFollow = (id) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allArtists.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.genre.toLowerCase().includes(q) ||
      a.instruments.toLowerCase().includes(q) ||
      a.style.toLowerCase().includes(q)
    );
  }, [query, allArtists]);

  return (
    <div className="page search-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div><div className="bar"></div>
          <div className="bar"></div><div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>🔍 {t('search.title')}</h1>
      </section>

      <div className="search-bar">
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
          autoFocus
        />
        <button className="search-button">🔍</button>
      </div>

      {query.trim() && (
        <div className="search-results">
          <h2>{t('search.resultsFor')} "{query.trim()}"</h2>

          {results.length === 0 ? (
            <p className="no-results">No artists found for "{query.trim()}".</p>
          ) : (
            <div className="results-list">
              {results.map((artist) => (
                <div key={artist.id} className="result-item">
                  <div className="result-avatar">{artist.avatar || '🎤'}</div>
                  <div className="result-info">
                    <h3>{artist.name}</h3>
                    <p className="result-type">{artist.genre} · {artist.style}</p>
                    <p className="result-instruments">🎸 {artist.instruments}</p>
                    {artist.location && <p className="result-location">📍 {artist.location}</p>}
                    <span className="result-stat">{(artist.followers || 0).toLocaleString()} {t('search.followers')}</span>
                  </div>
                  <button
                    className={`follow-btn${followed.has(artist.id) ? ' following' : ''}`}
                    onClick={() => toggleFollow(artist.id)}
                  >
                    {followed.has(artist.id) ? t('search.following') : t('search.follow')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
