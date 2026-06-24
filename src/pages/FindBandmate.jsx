import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { useGeoContext } from '../GeoContext';
import { proximityLabel } from '../lib/geolocation';
import './Pages.css';

const INSTRUMENTS = [
  'Guitar', 'Bass Guitar', 'Electric Guitar', 'Acoustic Guitar',
  'Piano', 'Keyboards', 'Synthesizer',
  'Drums', 'Percussion', 'Drum Machine',
  'Vocals', 'Backing Vocals',
  'Violin', 'Cello', 'Viola', 'Strings',
  'Saxophone', 'Trumpet', 'Trombone', 'Flute', 'Clarinet',
  'Oud', 'Banjo', 'Ukulele', 'Mandolin', 'Harmonica',
  'DJ / Turntables', 'Production', 'Beatmaking',
  'Songwriting', 'Composition', 'Mixing / Mastering', 'Other',
];

const GENRES = ['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Electronic', 'R&B', 'Folk', 'Classical', 'World', 'Reggae', 'Other'];

const LOCATIONS = [
  'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Rishon LeZion',
  'Petah Tikva', 'Netanya', 'Ashdod', 'Rehovot', 'Ramat Gan',
  'Herzliya', 'Raanana', 'Holon', 'Bat Yam', 'Eilat',
  'Tiberias', 'Nazareth', "Modi'in", 'Jaffa', 'Online / Remote',
];

const GENRE_COLORS = {
  'Pop': '#FF006E', 'Rock': '#FF4500', 'Jazz': '#FFD700', 'Hip-Hop': '#9B59B6',
  'Electronic': '#00D9FF', 'R&B': '#FF69B4', 'Folk': '#90EE90', 'Classical': '#DDA0DD',
  'World': '#FFA500', 'Reggae': '#00FF7F', 'Other': '#8A2BE2',
};

const SEED_POSTS = [
  {
    id: 'b1', instrument: 'Bass Guitar', genre: 'Rock', location: 'Tel Aviv',
    description: 'Our rock band needs a solid bassist for regular rehearsals and upcoming gigs. We play original music, influences: Arctic Monkeys, Pearl Jam.',
    postedBy: 'Moshe Levy', avatar: '🎸', contact: '', postedAt: '2026-06-08',
  },
  {
    id: 'b2', instrument: 'Vocals', genre: 'Jazz', location: 'Jerusalem',
    description: 'Looking for a jazz vocalist for a quartet. We perform standards and some originals. Weekly rehearsals.',
    postedBy: 'Yael Cohen', avatar: '🎹', contact: '', postedAt: '2026-06-07',
  },
  {
    id: 'b3', instrument: 'Drums', genre: 'Electronic', location: 'Haifa',
    description: 'Electronic / drum and bass project needs a live drummer. Studio sessions + live performances. Experienced players preferred.',
    postedBy: 'Dana Shamir', avatar: '🎧', contact: '', postedAt: '2026-06-06',
  },
  {
    id: 'b4', instrument: 'Violin', genre: 'Folk', location: 'Online / Remote',
    description: 'Recording a folk-acoustic EP remotely. Need a violinist for 3-4 tracks. Session musician or collaborator welcome.',
    postedBy: 'Tamar Ben-Ami', avatar: '🎤', contact: '', postedAt: '2026-06-05',
  },
  {
    id: 'b5', instrument: 'Production', genre: 'Hip-Hop', location: 'Tel Aviv',
    description: 'MC looking for a producer to create original beats. I write lyrics, you produce. Revenue sharing on any releases.',
    postedBy: 'Roni Katz', avatar: '🥁', contact: '', postedAt: '2026-06-04',
  },
  {
    id: 'b6', instrument: 'Oud', genre: 'World', location: 'Jaffa',
    description: 'World music ensemble has an opening for an oud player. We blend Middle Eastern, Mediterranean, and jazz sounds.',
    postedBy: 'Avi Mizrahi', avatar: '🪗', contact: '', postedAt: '2026-06-03',
  },
];

const EMPTY_FORM = {
  instrument: '', genre: '', location: '', description: '', contact: '',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

function FindBandmate() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lizi_bandmate_posts') || '[]'); } catch { return []; }
  });
  const { city: detectedCity } = useGeoContext();

  const [filterInstrument, setFilterInstrument] = useState('');
  const [filterGenre, setFilterGenre]           = useState('');
  const [filterLocation, setFilterLocation]     = useState('');
  const [formOpen, setFormOpen]                 = useState(false);
  const [formData, setFormData]                 = useState(EMPTY_FORM);
  const [formError, setFormError]               = useState('');

  const allPosts = useMemo(() => {
    return [...userPosts, ...SEED_POSTS];
  }, [userPosts]);

  const filtered = useMemo(() => {
    return allPosts.filter(p => {
      if (filterInstrument && p.instrument !== filterInstrument) return false;
      if (filterGenre      && p.genre      !== filterGenre)      return false;
      if (filterLocation   && p.location   !== filterLocation)   return false;
      return true;
    });
  }, [allPosts, filterInstrument, filterGenre, filterLocation]);

  const handleField = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.instrument || !formData.genre || !formData.location) {
      setFormError('Please fill in instrument, genre, and location.');
      return;
    }
    const post = {
      ...formData,
      id: `u${Date.now()}`,
      postedBy: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Musician',
      avatar: '🎵',
      postedAt: new Date().toISOString().slice(0, 10),
    };
    const next = [post, ...userPosts];
    setUserPosts(next);
    localStorage.setItem('lizi_bandmate_posts', JSON.stringify(next));
    setFormData(EMPTY_FORM);
    setFormError('');
    setFormOpen(false);
  };

  const clearFilters = () => {
    setFilterInstrument('');
    setFilterGenre('');
    setFilterLocation('');
  };

  const hasFilters = filterInstrument || filterGenre || filterLocation;

  return (
    <div className="page bandmate-page">
      <section className="events-hero">
        <div className="feed-eq-bars">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="feed-eq-bar" style={{ animationDelay: `${i * 0.09}s` }} />
          ))}
        </div>
        <h1 className="feed-hero-title">🔍 {t('bandmate.title')}</h1>
        <p className="feed-hero-sub">{t('bandmate.subtitle')}</p>
      </section>

      {/* Filter + Post bar */}
      <div className="events-filter-bar">
        <select className="genre-filter-dropdown" value={filterInstrument} onChange={e => setFilterInstrument(e.target.value)}>
          <option value="">🎸 All Instruments</option>
          {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select className="genre-filter-dropdown" value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
          <option value="">🎵 All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="genre-filter-dropdown" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
          <option value="">📍 All Locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {hasFilters && (
          <button className="studio-cancel-btn" onClick={clearFilters}>✕ Clear</button>
        )}
        {user ? (
          <button
            className={`collab-rec-btn ${formOpen ? 'rec-cancel' : ''}`}
            onClick={() => setFormOpen(v => !v)}
          >
            <span className="rec-dot" />
            {formOpen ? 'Cancel' : t('bandmate.postListing')}
          </button>
        ) : (
          <button className="collab-rec-btn" onClick={() => navigate('/login')}>
            <span className="rec-dot" /> Login to Post
          </button>
        )}
      </div>

      {/* Post form */}
      {formOpen && (
        <section className="collab-studio-form">
          <div className="studio-form-header">
            <span className="studio-form-icon">🔍</span>
            <h2>{t('bandmate.postListing')}</h2>
          </div>
          {formError && <div className="collab-form-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="studio-form-grid">
            <label className="studio-field">
              <span className="studio-field-label">🎸 {t('bandmate.form.instrument')}</span>
              <select className="studio-input studio-select" value={formData.instrument} onChange={handleField('instrument')}>
                <option value="">Looking for…</option>
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <label className="studio-field">
              <span className="studio-field-label">🎵 {t('bandmate.form.genre')}</span>
              <select className="studio-input studio-select" value={formData.genre} onChange={handleField('genre')}>
                <option value="">Genre…</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="studio-field">
              <span className="studio-field-label">📍 {t('bandmate.form.location')}</span>
              <select className="studio-input studio-select" value={formData.location} onChange={handleField('location')}>
                <option value="">Location…</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="studio-field studio-field-full">
              <span className="studio-field-label">📝 {t('bandmate.form.description')}</span>
              <textarea
                className="studio-input studio-textarea"
                value={formData.description}
                onChange={handleField('description')}
                placeholder="Tell musicians about your project, your style, what you're looking for…"
                rows={3}
              />
            </label>
            <label className="studio-field studio-field-full">
              <span className="studio-field-label">📱 {t('bandmate.form.contact')}</span>
              <input
                type="text"
                className="studio-input"
                value={formData.contact}
                onChange={handleField('contact')}
                placeholder="WhatsApp number or email"
              />
            </label>
            <div className="studio-form-actions">
              <button type="button" className="studio-cancel-btn" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" className="collab-rec-btn">
                <span className="rec-dot" /> Post Listing
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Count */}
      <div className="bandmate-count-row">
        <span className="search-section-count">
          {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}
          {hasFilters && ' matching your filters'}
        </span>
      </div>

      {/* Listings grid */}
      <div className="bandmate-grid">
        {filtered.length === 0 ? (
          <div className="search-empty">
            <span className="search-empty-icon">🔍</span>
            <p>No listings match your filters.</p>
          </div>
        ) : (
          filtered.map(post => {
            const color = GENRE_COLORS[post.genre] || '#8A2BE2';
            return (
              <div
                key={post.id}
                className="bandmate-card"
                style={{ '--bm-color': color }}
              >
                <div className="bandmate-card-header">
                  <div className="bandmate-avatar">{post.avatar}</div>
                  <div className="bandmate-header-info">
                    <span className="bandmate-instrument">{post.instrument}</span>
                    <span className="bandmate-genre-chip" style={{ background: color }}>
                      {post.genre}
                    </span>
                  </div>
                </div>
                <div className="bandmate-meta">
                  <span className="event-meta">📍 {post.location}</span>
                  {(() => {
                    const prox = proximityLabel(detectedCity, post.location);
                    if (!prox) return null;
                    const labels = { exact: t('geo.nearYou'), nearby: t('geo.nearby'), remote: t('geo.remote') };
                    return (
                      <span className={`near-you-badge near-you-badge--${prox}`}>
                        {prox === 'exact' ? '📍' : prox === 'remote' ? '🌐' : '🗺️'} {labels[prox]}
                      </span>
                    );
                  })()}
                  <span className="event-meta">🕑 {timeAgo(post.postedAt)}</span>
                </div>
                {post.description && (
                  <p className="bandmate-desc">{post.description}</p>
                )}
                <div className="bandmate-footer">
                  <span className="event-posted-by">Posted by {post.postedBy}</span>
                  {post.contact ? (
                    <button
                      className="mpc-contact-btn mpc-whatsapp"
                      onClick={() => {
                        const clean = post.contact.replace(/\D/g, '');
                        const msg = encodeURIComponent(`Hi ${post.postedBy}! I saw your listing on LIZI looking for a ${post.instrument} player 🎵`);
                        if (clean.length >= 9) {
                          window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
                        } else {
                          window.open(`mailto:${post.contact}?subject=${encodeURIComponent('LIZI – Bandmate')}&body=${msg}`);
                        }
                      }}
                    >
                      📱 Contact
                    </button>
                  ) : (
                    <button
                      className="mpc-contact-btn mpc-chat-tab"
                      onClick={() => {
                        const msg = encodeURIComponent(`Hi ${post.postedBy}! I saw your listing on LIZI looking for a ${post.instrument} player 🎵`);
                        window.open(`https://wa.me/?text=${msg}`, '_blank');
                      }}
                    >
                      📱 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FindBandmate;
