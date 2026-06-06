import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchArtists } from '../lib/db';
import './Pages.css';

const parseAgeRange = (range) => {
  const normalized = String(range || '').trim();
  if (!normalized) return null;
  const plusMatch = normalized.match(/^(\d+)\+$/);
  if (plusMatch) return { min: Number(plusMatch[1]), max: Infinity };
  const betweenMatch = normalized.match(/^(\d+)[^\d]+(\d+)$/);
  if (betweenMatch) return { min: Number(betweenMatch[1]), max: Number(betweenMatch[2]) };
  const single = Number(normalized.replace(/[^0-9]/g, ''));
  if (!Number.isNaN(single)) return { min: single, max: single };
  return null;
};

const rangeOverlap = (a, b) => {
  if (!a || !b) return false;
  return a.min <= b.max && b.min <= a.max;
};

function matchScore(artist, userGenres, userInstruments, userStyle, userAgeRange) {
  let score = 0;
  let maxScore = 0;

  if (userGenres.length > 0) {
    maxScore += 40;
    if (userGenres.some(g => artist.genre.toLowerCase().includes(g) || g.includes(artist.genre.toLowerCase()))) score += 40;
  }
  if (userInstruments.length > 0) {
    maxScore += 30;
    const matched = userInstruments.filter(ui => artist.instruments.toLowerCase().includes(ui)).length;
    score += Math.round((matched / userInstruments.length) * 30);
  }
  if (userStyle) {
    maxScore += 20;
    if (artist.style.toLowerCase().includes(userStyle) || userStyle.includes(artist.style.toLowerCase())) score += 20;
  }
  if (userAgeRange) {
    maxScore += 10;
    if (rangeOverlap(userAgeRange, parseAgeRange(artist.ageRange))) score += 10;
  }

  if (maxScore === 0) return null;
  return Math.round((score / maxScore) * 100);
}

function OpenStage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists().then((data) => {
      setAllArtists(data);
      setLoading(false);
    });
  }, []);

  const userGenres      = useMemo(() => user?.user_metadata?.favoriteGenres?.toLowerCase().split(',').map(g => g.trim()).filter(Boolean) || [], [user]);
  const userInstruments = useMemo(() => user?.user_metadata?.instruments?.toLowerCase().split(',').map(i => i.trim()).filter(Boolean) || [], [user]);
  const userStyle       = useMemo(() => user?.user_metadata?.musicStyle?.toLowerCase().trim() || '', [user]);
  const userAgeRange    = useMemo(() => parseAgeRange(user?.user_metadata?.connectAges), [user]);
  const hasPreferences  = userGenres.length > 0 || userInstruments.length > 0 || Boolean(userStyle) || Boolean(userAgeRange);

  const artistsWithScore = useMemo(() => {
    return allArtists.map(artist => ({
      ...artist,
      matchPct: user && hasPreferences ? matchScore(artist, userGenres, userInstruments, userStyle, userAgeRange) : null,
    }));
  }, [allArtists, user, hasPreferences, userGenres, userInstruments, userStyle, userAgeRange]);

  const filteredArtists = useMemo(() => {
    let filtered = artistsWithScore;
    if (selectedGenre !== 'All') filtered = filtered.filter(a => a.genre === selectedGenre);
    if (!user || !hasPreferences) return filtered;
    filtered = filtered.filter(a => a.matchPct === null || a.matchPct > 0);
    return [...filtered].sort((a, b) => (b.matchPct ?? 0) - (a.matchPct ?? 0));
  }, [selectedGenre, artistsWithScore, user, hasPreferences]);

  const genres = ['All', ...new Set(allArtists.map(a => a.genre))];

  const matchColor = (pct) => {
    if (pct >= 80) return '#00e676';
    if (pct >= 50) return '#ffb300';
    return '#ff7043';
  };

  return (
    <div className="page open-stage-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div><div className="bar"></div>
          <div className="bar"></div><div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>🎤 {t('openStage.title')}</h1>
        <p className="subtitle">{t('openStage.subtitle')}</p>
        {user && hasPreferences && (
          <>
            <p className="filter-hint">Curated for your musical interests · {filteredArtists.length} artists found</p>
            <p className="suggested-label">{t('openStage.suggestedForYou')}</p>
          </>
        )}
        {user && (
          <Link to="/profile" className="profile-action-btn">{t('openStage.updateProfile')}</Link>
        )}
      </section>

      <div className="filters">
        {genres.map(genre => (
          <button
            key={genre}
            className={`filter-btn ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => setSelectedGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading artists…</div>
      ) : (
        <div className="artists-grid">
          {filteredArtists.length === 0 ? (
            <p className="no-results">
              No artists match this filter.{' '}
              <Link to="/profile">Update your profile</Link> to broaden results.
            </p>
          ) : (
            filteredArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                {artist.matchPct !== null && (
                  <div
                    className="match-badge"
                    style={{ background: matchColor(artist.matchPct) }}
                    title="Match percentage based on your profile"
                  >
                    {artist.matchPct}% match
                  </div>
                )}
                <div className="artist-avatar">{artist.avatar || '🎤'}</div>
                <h3>{artist.name}</h3>
                <p className="genre-tag">{artist.genre}</p>
                <p className="instruments">🎸 {artist.instruments}</p>
                <p className="style-tag">{artist.style}</p>
                {artist.ageRange && <p className="age-range">👥 Ages: {artist.ageRange}</p>}
                {artist.location && <p className="artist-location">📍 {artist.location}</p>}
                <div className="followers">⭐ {(artist.followers || 0).toLocaleString()} {t('openStage.followers')}</div>
                <button className="listen-btn">{t('openStage.listenNow')}</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default OpenStage;
