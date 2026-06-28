import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchArtists, fetchRecentProfiles } from '../lib/db';
import translations from '../translations';
import { useGeoContext } from '../GeoContext';
import { useFavourites } from '../hooks/useFavourites';
import './Pages.css';

/* ── Genre normalisation ──────────────────────────────────────────────
   Stored values are always English (e.g. "Hip-Hop").
   normalizeGenre strips hyphens and lowercases so "Hip-Hop" → "hip hop"
   for comparison, while also mapping Hebrew labels back to English.       */
const HE_GENRES = translations.he.dropdowns.genres;
const EN_GENRES = translations.en.dropdowns.genres;

const norm = s => s.toLowerCase().replace(/-/g, ' ').trim();

const normalizeGenre = g => {
  const idx = HE_GENRES.indexOf(g);
  return idx !== -1 ? norm(EN_GENRES[idx]) : norm(g);
};

/* ── Location region map ──────────────────────────────────────────────
   Same region → partial credit; same city → full credit.               */
const REGION = {
  'Tel Aviv': 'center', 'Jaffa': 'center', 'Ramat Gan': 'center',
  'Bnei Brak': 'center', 'Herzeliya': 'center', 'Ramat Hasharon': 'center',
  'Rishon': 'center', 'Netanya': 'center', "Modi'in": 'center',
  'Jerusalem': 'jerusalem',
  'Ashdod': 'south', 'Beer Sheva': 'south', 'Eilat': 'south',
  'Haifa': 'north', 'Safed': 'north', 'Nazareth': 'north',
};

const calcLocationScore = (userLoc, artistLoc) => {
  if (!userLoc || !artistLoc) return 0;
  const uL = userLoc.toLowerCase();
  const aL = artistLoc.toLowerCase();
  if (uL === 'remote / online' || aL === 'remote / online') return 0.7;
  if (uL === aL) return 1;
  const ur = REGION[userLoc];
  const ar = REGION[artistLoc];
  if (ur && ar && ur === ar) return 0.5;
  return 0;
};

/* ── Age-range helpers ────────────────────────────────────────────── */
const parseAgeRange = range => {
  const s = String(range || '').trim();
  if (!s) return null;
  const plus = s.match(/^(\d+)\+$/);
  if (plus) return { min: +plus[1], max: Infinity };
  const between = s.match(/^(\d+)[^\d]+(\d+)$/);
  if (between) return { min: +between[1], max: +between[2] };
  const n = Number(s.replace(/\D/g, ''));
  return Number.isNaN(n) ? null : { min: n, max: n };
};
const rangeOverlap = (a, b) => a && b && a.min <= b.max && b.min <= a.max;

/* ── Core match function ──────────────────────────────────────────────
   Returns { pct: 0-100, factors: string[] } or null when no prefs set.
   Weights: Genre 35 · Location 20 · Instruments 20 · Style 15 · Age 10 */
function matchScore(artist, { genres, location, instruments, style, ageRange }) {
  let score = 0;
  let max = 0;
  const factors = [];

  if (genres.length > 0) {
    max += 35;
    const ag = norm(artist.genre);
    if (genres.some(g => ag === g || ag.includes(g) || g.includes(ag))) {
      score += 35;
      factors.push('genre');
    }
  }

  if (location) {
    max += 20;
    const ls = calcLocationScore(location, artist.location);
    if (ls > 0) {
      score += Math.round(ls * 20);
      factors.push('location');
    }
  }

  if (instruments.length > 0) {
    max += 20;
    const matched = instruments.filter(i => artist.instruments.toLowerCase().includes(i)).length;
    const pts = Math.round((matched / instruments.length) * 20);
    if (pts > 0) { score += pts; factors.push('instruments'); }
  }

  if (style) {
    max += 15;
    if (artist.style.toLowerCase().includes(style) || style.includes(artist.style.toLowerCase())) {
      score += 15;
      factors.push('style');
    }
  }

  if (ageRange) {
    max += 10;
    if (rangeOverlap(ageRange, parseAgeRange(artist.ageRange))) {
      score += 10;
      factors.push('age');
    }
  }

  if (max === 0) return null;
  return { pct: Math.round((score / max) * 100), factors };
}

/* ── Match badge colour ─────────────────────────────────────────────── */
const matchColor = pct =>
  pct >= 80 ? '#00e676' : pct >= 55 ? '#ffb300' : pct >= 30 ? '#ff7043' : '#9e9e9e';

/* ── Factor label config ────────────────────────────────────────────── */
const FACTOR_META = {
  genre:       { icon: '🎵', color: '#00CFFF' },
  location:    { icon: '📍', color: '#A855F7' },
  instruments: { icon: '🎸', color: '#FF006E' },
  style:       { icon: '🎭', color: '#FFB300' },
  age:         { icon: '👥', color: '#78909C' },
};

/* ══════════════════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════════════════ */
function OpenStage() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { city: geoCity } = useGeoContext();
  const { isFav, toggle: toggleFav } = useFavourites();
  const [allArtists, setAllArtists]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedGenre, setSelectedGenre]   = useState('All');
  const [recentProfiles, setRecentProfiles] = useState([]);

  useEffect(() => {
    fetchArtists().then(data => { setAllArtists(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchRecentProfiles(8).then(setRecentProfiles);
  }, [isAuthenticated]);

  /* User profile preferences — fall back to GPS city when no saved location */
  const userProfile = useMemo(() => {
    const m = user?.user_metadata || {};
    return {
      genres:      (m.favoriteGenres || '').split(',').map(g => normalizeGenre(g.trim())).filter(Boolean),
      location:    m.location || geoCity || '',
      instruments: (m.instruments || '').toLowerCase().split(',').map(i => i.trim()).filter(Boolean),
      style:       (m.musicStyle || '').toLowerCase().trim(),
      ageRange:    parseAgeRange(m.connectAges),
    };
  }, [user]);

  const hasPreferences = useMemo(() =>
    userProfile.genres.length > 0 ||
    Boolean(userProfile.location) ||
    userProfile.instruments.length > 0 ||
    Boolean(userProfile.style) ||
    Boolean(userProfile.ageRange),
  [userProfile]);

  /* Attach match score to each artist */
  const artistsWithScore = useMemo(() =>
    allArtists.map(a => ({
      ...a,
      match: (user && hasPreferences) ? matchScore(a, userProfile) : null,
    })),
  [allArtists, user, hasPreferences, userProfile]);

  /* Filter by genre chip, then sort by match % */
  const filteredArtists = useMemo(() => {
    let list = selectedGenre === 'All'
      ? [...artistsWithScore]
      : artistsWithScore.filter(a => a.genre === selectedGenre);

    if (user && hasPreferences) {
      list.sort((a, b) => (b.match?.pct ?? -1) - (a.match?.pct ?? -1));
    }
    return list;
  }, [artistsWithScore, selectedGenre, user, hasPreferences]);

  const genres = ['All', ...new Set(allArtists.map(a => a.genre))];

  /* Profile summary chips (what's being matched) */
  const profileChips = useMemo(() => {
    if (!user || !hasPreferences) return [];
    const chips = [];
    if (userProfile.genres.length > 0)
      chips.push({ icon: '🎵', label: userProfile.genres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ') });
    if (userProfile.location)
      chips.push({ icon: '📍', label: userProfile.location });
    if (userProfile.instruments.length > 0)
      chips.push({ icon: '🎸', label: userProfile.instruments.slice(0, 2).map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ') });
    if (userProfile.style)
      chips.push({ icon: '🎭', label: userProfile.style.charAt(0).toUpperCase() + userProfile.style.slice(1) });
    return chips;
  }, [user, hasPreferences, userProfile]);

  const factorLabel = key => {
    const map = {
      genre: t('openStage.matchGenre'),
      location: t('openStage.matchLocation'),
      instruments: t('openStage.matchInstruments'),
      style: t('openStage.matchStyle'),
      age: t('openStage.matchAge'),
    };
    return map[key] || key;
  };

  return (
    <div className="page open-stage-page">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-sound-bars">
          <div className="bar" /><div className="bar" /><div className="bar" />
          <div className="bar" /><div className="bar" />
        </div>
        <h1>🎤 {t('openStage.title')}</h1>
        <p className="subtitle">{t('openStage.subtitle')}</p>
      </section>

      {/* ── Profile match summary ── */}
      {user && hasPreferences && profileChips.length > 0 && (
        <div className="os-match-summary">
          <span className="os-match-label">{t('openStage.matchingBy')}:</span>
          {profileChips.map((c, i) => (
            <span key={i} className="os-match-chip">
              {c.icon} {c.label}
            </span>
          ))}
          <Link to="/profile" className="os-edit-profile">✏️ {t('openStage.updateProfile')}</Link>
        </div>
      )}

      {/* ── No-profile prompt ── */}
      {user && !hasPreferences && (
        <div className="os-no-profile">
          <span>🎯 {t('openStage.completeProfile')}</span>
          <Link to="/profile" className="os-setup-btn">{t('openStage.goToProfile')}</Link>
        </div>
      )}

      {/* ── Genre filter chips ── */}
      <div className="filters">
        {genres.map(genre => (
          <button
            key={genre}
            className={`filter-btn ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => setSelectedGenre(genre)}
          >
            {genre === 'All' ? t('openStage.allGenres') : genre}
          </button>
        ))}
      </div>

      {/* ── Artists grid ── */}
      {loading ? (
        <div className="loading-state">Loading artists…</div>
      ) : (
        <div className="artists-grid">
          {filteredArtists.length === 0 ? (
            <p className="no-results">No artists found for this genre.</p>
          ) : (
            filteredArtists.map(artist => {

              const match = artist.match;
              const pct   = match?.pct ?? null;
              const dimmed = pct !== null && pct === 0;

              return (
                <div
                  key={artist.id}
                  className={`artist-card ${dimmed ? 'artist-card--dim' : ''}`}
                >
                  {/* Match badge */}
                  {pct !== null && (
                    <div
                      className="match-badge"
                      style={{ background: matchColor(pct) }}
                      title="Match based on your profile"
                    >
                      {pct}%
                    </div>
                  )}

                  <div className="artist-avatar">{artist.avatar || '🎤'}</div>
                  <h3>{artist.name}</h3>

                  {/* Match factor pills */}
                  {match?.factors?.length > 0 && (
                    <div className="os-factor-pills">
                      {match.factors.map(f => (
                        <span
                          key={f}
                          className="os-factor-pill"
                          style={{ '--fpill-color': FACTOR_META[f]?.color || '#888' }}
                        >
                          {FACTOR_META[f]?.icon} {factorLabel(f)}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="genre-tag">{artist.genre}</p>
                  <p className="instruments">🎸 {artist.instruments}</p>
                  <p className="style-tag">{artist.style}</p>

                  {artist.location && (
                    <p className="artist-location">
                      📍 {artist.location}
                      {userProfile.location && calcLocationScore(userProfile.location, artist.location) === 1 && (
                        <span className="os-near-badge">{t('openStage.nearYou')}</span>
                      )}
                    </p>
                  )}

                  {artist.ageRange && (
                    <p className="age-range">👥 {artist.ageRange}</p>
                  )}

                  <div className="followers">
                    ⭐ {(artist.followers || 0).toLocaleString()} {t('openStage.followers')}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="listen-btn">{t('openStage.connect')}</button>
                    <button
                      className={`fav-btn ${isFav(artist.id) ? 'fav-btn--on' : ''}`}
                      onClick={() => toggleFav({ type: 'artist', id: artist.id, name: artist.name, avatar: artist.avatar, genre: artist.genre, instruments: artist.instruments, location: artist.location, style: artist.style, followers: artist.followers })}
                      title={isFav(artist.id) ? 'Remove from favourites' : 'Add to favourites'}
                    >
                      {isFav(artist.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Recently Joined ── */}
      {recentProfiles.length > 0 && (
        <section className="os-recent-section">
          <h2 className="os-recent-title">
            🆕 {language === 'he' ? 'הצטרפו לאחרונה' : 'Recently Joined'}
          </h2>
          <div className="recent-pills-wrap">
            {recentProfiles.map((profile, i) => {
              const PILL_COLORS = ['#534AB7', '#1D9E75', '#D4537E', '#00D9FF', '#BA7517'];
              const accent = PILL_COLORS[i % PILL_COLORS.length];
              const genre  = profile.favorite_genres || profile.music_style || null;
              return (
                <div
                  key={profile.id}
                  className="recent-pill"
                  style={{ '--pill-accent': accent, borderColor: accent }}
                >
                  <div className="recent-pill-avatar" style={{ background: accent }}>🎤</div>
                  <div className="recent-pill-info">
                    <span className="recent-pill-name">{profile.name}</span>
                    {genre && <span className="recent-pill-genre" style={{ color: accent }}>{genre}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default OpenStage;
