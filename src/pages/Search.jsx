import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { fetchArtists, fetchProjects } from '../lib/db';
import './Pages.css';

const GENRE_COLORS = {
  'Pop':        '#FF006E',
  'Rock':       '#FF4500',
  'Jazz':       '#FFD700',
  'Hip-Hop':    '#9B59B6',
  'Electronic': '#00D9FF',
  'R&B':        '#FF69B4',
  'Folk':       '#90EE90',
  'Classical':  '#DDA0DD',
  'World':      '#FFA500',
  'Reggae':     '#00FF7F',
};

function genreColor(genre) {
  return GENRE_COLORS[genre] || '#8A2BE2';
}

function Search() {
  const [query, setQuery] = useState('');
  const [followed, setFollowed] = useState(new Set());
  const [allArtists, setAllArtists] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetchArtists().then(setAllArtists);
    fetchProjects().then(setAllProjects);
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
    <div className="page search-page-v2">

      {/* Hero */}
      <section className="search-hero">
        <div className="search-eq-bars">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="search-eq-bar" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <h1 className="search-hero-title">{t('search.heroTitle')}</h1>
        <p className="search-hero-sub">{t('search.heroSub')}</p>
      </section>

      {/* Search bar */}
      <div className="search-track-bar">
        <span className="search-track-icon">🎙️</span>
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-track-input"
          autoFocus
        />
        {query && (
          <button className="search-clear-btn" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {/* Artist results */}
      {query.trim() && (
        <section className="search-section">
          <div className="search-section-header">
            <span className="search-section-icon">🎤</span>
            <h2 className="search-section-title">{t('search.artistsSection')}</h2>
            <span className="search-section-count">{results.length} {t('search.found')}</span>
          </div>

          {results.length === 0 ? (
            <div className="search-empty">
              <span className="search-empty-icon">🎵</span>
              <p>{t('search.noArtistsFound')} &ldquo;{query.trim()}&rdquo;</p>
            </div>
          ) : (
            <div className="artist-track-list">
              {results.map((artist, idx) => (
                <div key={artist.id} className="artist-track-card">
                  <span className="track-number">{String(idx + 1).padStart(2, '0')}</span>
                  <div
                    className="artist-vinyl"
                    style={{ '--genre-color': genreColor(artist.genre) }}
                  >
                    <span className="artist-vinyl-emoji">{artist.avatar || '🎤'}</span>
                  </div>
                  <div className="artist-track-info">
                    <span className="artist-track-name">{artist.name}</span>
                    <div className="artist-track-meta">
                      <span
                        className="genre-chip"
                        style={{ '--chip-color': genreColor(artist.genre) }}
                      >
                        {artist.genre}
                      </span>
                      {artist.style && <span className="style-chip">{artist.style}</span>}
                      {artist.instruments && (
                        <span className="instruments-chip">🎸 {artist.instruments}</span>
                      )}
                    </div>
                    {artist.location && (
                      <span className="artist-location">📍 {artist.location}</span>
                    )}
                  </div>
                  <div className="artist-track-right">
                    <span className="artist-followers">
                      {(artist.followers || 0).toLocaleString()} {t('search.followers')}
                    </span>
                    <button
                      className={`follow-track-btn${followed.has(artist.id) ? ' is-following' : ''}`}
                      onClick={() => toggleFollow(artist.id)}
                    >
                      {followed.has(artist.id) ? t('search.followingBtn') : t('search.followBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* All Projects */}
      <section className="search-section">
        <div className="search-section-header">
          <span className="search-section-icon">🎛️</span>
          <h2 className="search-section-title">{t('search.projectsSection')}</h2>
          <span className="search-section-count">{allProjects.length} {t('search.projects')}</span>
        </div>

        {allProjects.length === 0 ? (
          <div className="search-empty">
            <span className="search-empty-icon">🥁</span>
            <p>{t('search.noProjects')}</p>
          </div>
        ) : (
          <div className="project-studio-grid">
            {allProjects.map((project) => {
              const color = genreColor(project.genre);
              const memberCount = project.members || 1;
              return (
                <div
                  key={project.id}
                  className="project-studio-card"
                  style={{ '--project-color': color }}
                >
                  <div className="project-studio-top">
                    <div className="project-studio-led" />
                    <span className="project-studio-genre">{project.genre || 'Various'}</span>
                    <span className="project-studio-members">
                      👥 {memberCount} {memberCount === 1 ? t('search.members') : t('search.membersPlural')}
                    </span>
                  </div>

                  <div className="project-studio-waveform">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className="project-waveform-bar"
                        style={{
                          height: `${20 + Math.sin(i * 1.3 + (project.id % 6)) * 14}px`,
                          animationDelay: `${i * 0.05}s`,
                          background: color,
                        }}
                      />
                    ))}
                  </div>

                  <h3 className="project-studio-title">{project.title}</h3>

                  {project.description && (
                    <p className="project-studio-desc">{project.description}</p>
                  )}

                  <div className="project-studio-tags">
                    {project.instruments && (
                      <span className="project-tag">🎸 {project.instruments}</span>
                    )}
                    {project.ageRange && (
                      <span className="project-tag">👤 {t('search.ages')} {project.ageRange}</span>
                    )}
                    {project.location && (
                      <span className="project-tag">📍 {project.location}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Search;
