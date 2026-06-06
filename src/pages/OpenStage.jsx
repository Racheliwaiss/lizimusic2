import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import allArtists from '../data/artists';
import './Pages.css';

function OpenStage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Filter artists based on selected genre and user interests
  const filteredArtists = useMemo(() => {
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

    let filtered = [...allArtists];

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(artist => artist.genre === selectedGenre);
    }

    if (!user) return filtered;

    const userGenres = user?.user_metadata?.favoriteGenres?.toLowerCase().split(',').map(g => g.trim()).filter(Boolean) || [];
    const userInstruments = user?.user_metadata?.instruments?.toLowerCase().split(',').map(i => i.trim()).filter(Boolean) || [];
    const userStyle = user?.user_metadata?.musicStyle?.toLowerCase().trim() || '';
    const userAgeRange = parseAgeRange(user?.user_metadata?.connectAges);
    const hasPreferences = userGenres.length > 0 || userInstruments.length > 0 || Boolean(userStyle) || Boolean(userAgeRange);

    filtered = filtered.filter(artist => {
      if (!hasPreferences) return true;

      const genreMatch = userGenres.length === 0 || userGenres.some(g => artist.genre.toLowerCase().includes(g) || g.includes(artist.genre.toLowerCase()));
      const instrumentMatch = userInstruments.length === 0 || userInstruments.some(ui => artist.instruments.toLowerCase().includes(ui));
      const styleMatch = !userStyle || artist.style.toLowerCase().includes(userStyle);
      const ageMatch = !userAgeRange || rangeOverlap(userAgeRange, parseAgeRange(artist.ageRange));

      return genreMatch && instrumentMatch && styleMatch && ageMatch;
    });

    filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (userGenres.some(g => a.genre.toLowerCase().includes(g) || g.includes(a.genre.toLowerCase()))) scoreA += 3;
      if (userGenres.some(g => b.genre.toLowerCase().includes(g) || g.includes(b.genre.toLowerCase()))) scoreB += 3;

      if (userInstruments.some(ui => a.instruments.toLowerCase().includes(ui))) scoreA += 2;
      if (userInstruments.some(ui => b.instruments.toLowerCase().includes(ui))) scoreB += 2;

      if (userStyle && a.style.toLowerCase().includes(userStyle)) scoreA += 2;
      if (userStyle && b.style.toLowerCase().includes(userStyle)) scoreB += 2;

      if (userAgeRange && rangeOverlap(userAgeRange, parseAgeRange(a.ageRange))) scoreA += 1;
      if (userAgeRange && rangeOverlap(userAgeRange, parseAgeRange(b.ageRange))) scoreB += 1;

      return scoreB - scoreA;
    });

    return filtered;
  }, [selectedGenre, user]);

  const genres = ['All', ...new Set(allArtists.map(a => a.genre))];

  return (
    <div className="page open-stage-page">
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <h1>🎤 {t('openStage.title')}</h1>
        <p className="subtitle">{t('openStage.subtitle')}</p>
        {user && (
          <>
            <p className="filter-hint">Curated for your musical interests</p>
            <p className="suggested-label">{t('openStage.suggestedForYou')}</p>
            <Link to="/profile" className="profile-action-btn">
              {t('openStage.updateProfile')}
            </Link>
          </>
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

      <div className="artists-grid">
        {filteredArtists.map((artist) => (
          <div key={artist.id} className="artist-card">
            <div className="artist-avatar">🎤</div>
            <h3>{artist.name}</h3>
            <p className="genre-tag">{artist.genre}</p>
            <p className="instruments">🎸 {artist.instruments}</p>
            <p className="style-tag">{artist.style}</p>
            <p className="age-range">👥 Ages: {artist.ageRange}</p>
            <div className="followers">⭐ {artist.followers} {t('openStage.followers')}</div>
            <button className="listen-btn">{t('openStage.listenNow')}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OpenStage;
