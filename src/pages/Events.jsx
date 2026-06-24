import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { useGeoContext } from '../GeoContext';
import { proximityLabel } from '../lib/geolocation';
import './Pages.css';

const EVENT_TYPES = ['Jam Session', 'Rehearsal', 'Gig', 'Workshop', 'Open Mic'];
const GENRES = ['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'Electronic', 'R&B', 'Folk', 'Classical', 'World', 'Reggae', 'Other'];
const LOCATIONS = [
  'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Rishon LeZion',
  'Petah Tikva', 'Netanya', 'Ashdod', 'Rehovot', 'Ramat Gan',
  'Herzliya', 'Raanana', 'Holon', 'Bat Yam', 'Eilat',
  'Tiberias', 'Nazareth', "Modi'in", 'Jaffa', 'Online / Remote',
];

const TYPE_COLORS = {
  'Jam Session': '#FF006E',
  'Rehearsal':   '#8A2BE2',
  'Gig':         '#FFD700',
  'Workshop':    '#00D9FF',
  'Open Mic':    '#FF69B4',
};

const TYPE_ICONS = {
  'Jam Session': '🎸',
  'Rehearsal':   '🥁',
  'Gig':         '🎤',
  'Workshop':    '🎓',
  'Open Mic':    '🎙️',
};

const SEED_EVENTS = [
  {
    id: 'e1', type: 'Jam Session', title: 'Jazz Jam Night',
    genre: 'Jazz', location: 'Tel Aviv', date: '2026-06-18', time: '20:00',
    description: 'Open jazz jam for all levels. Bring your instrument and join the groove!',
    contact: '', postedBy: 'Yael Cohen', avatar: '🎹',
  },
  {
    id: 'e2', type: 'Open Mic', title: 'Open Mic at Beit HaOmaman',
    genre: 'Folk', location: 'Jerusalem', date: '2026-06-20', time: '19:30',
    description: 'Monthly open mic night. 5-minute slots, sign up at the door. All genres welcome.',
    contact: '', postedBy: 'Roni Katz', avatar: '🎤',
  },
  {
    id: 'e3', type: 'Workshop', title: 'Electronic Music Production Workshop',
    genre: 'Electronic', location: 'Online / Remote', date: '2026-06-22', time: '18:00',
    description: 'Learn Ableton Live basics. From beat-making to mixing. Beginner-friendly.',
    contact: '', postedBy: 'Dana Shamir', avatar: '🎧',
  },
  {
    id: 'e4', type: 'Rehearsal', title: 'Rock Band Rehearsal – Need Bassist',
    genre: 'Rock', location: 'Haifa', date: '2026-06-15', time: '17:00',
    description: 'We rehearse every Sunday. Looking for a bassist to complete the lineup.',
    contact: '', postedBy: 'Moshe Levy', avatar: '🎸',
  },
  {
    id: 'e5', type: 'Gig', title: 'Summer Rooftop Concert',
    genre: 'Pop', location: 'Tel Aviv', date: '2026-07-04', time: '21:00',
    description: 'Rooftop gig with 3 acts. Tickets at the door. Great view of the city.',
    contact: '', postedBy: 'Tamar Ben-Ami', avatar: '🌆',
  },
  {
    id: 'e6', type: 'Jam Session', title: 'World Music Jam',
    genre: 'World', location: 'Jaffa', date: '2026-06-28', time: '19:00',
    description: 'Middle Eastern, African, and Mediterranean vibes. Oud, percussion, flute welcome!',
    contact: '', postedBy: 'Avi Mizrahi', avatar: '🪗',
  },
];

const EMPTY_FORM = {
  title: '', type: '', genre: '', location: '', date: '', time: '', description: '', contact: '',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Events() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userEvents, setUserEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lizi_events') || '[]'); } catch { return []; }
  });
  const { city: detectedCity } = useGeoContext();

  const [filterType, setFilterType]     = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterGenre, setFilterGenre]   = useState('');
  const [formOpen, setFormOpen]         = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState('');

  const allEvents = useMemo(() => {
    const combined = [...SEED_EVENTS, ...userEvents];
    return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [userEvents]);

  const filtered = useMemo(() => {
    return allEvents.filter(ev => {
      if (filterType     && ev.type     !== filterType)                return false;
      if (filterLocation && ev.location !== filterLocation)            return false;
      if (filterGenre    && ev.genre    !== filterGenre)               return false;
      return true;
    });
  }, [allEvents, filterType, filterLocation, filterGenre]);

  const handleField = (field) => (e) => setFormData(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.type || !formData.location || !formData.date) {
      setFormError('Please fill in title, type, location, and date.');
      return;
    }
    const ev = {
      ...formData,
      id: `u${Date.now()}`,
      postedBy: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Musician',
      avatar: '🎵',
    };
    const next = [ev, ...userEvents];
    setUserEvents(next);
    localStorage.setItem('lizi_events', JSON.stringify(next));
    setFormData(EMPTY_FORM);
    setFormError('');
    setFormOpen(false);
  };

  const isPast = (dateStr) => new Date(dateStr) < new Date();

  return (
    <div className="page events-page">
      <section className="events-hero">
        <div className="feed-eq-bars">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="feed-eq-bar" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
        <h1 className="feed-hero-title">🎤 {t('events.title')}</h1>
        <p className="feed-hero-sub">{t('events.subtitle')}</p>
      </section>

      {/* Filter bar */}
      <div className="events-filter-bar">
        <select className="genre-filter-dropdown" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">🎉 All Types</option>
          {EVENT_TYPES.map(tp => <option key={tp} value={tp}>{TYPE_ICONS[tp]} {tp}</option>)}
        </select>
        <select className="genre-filter-dropdown" value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
          <option value="">🎵 All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="genre-filter-dropdown" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
          <option value="">📍 All Locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {user ? (
          <button
            className={`collab-rec-btn ${formOpen ? 'rec-cancel' : ''}`}
            onClick={() => setFormOpen(v => !v)}
          >
            <span className="rec-dot" />
            {formOpen ? 'Cancel' : t('events.postEvent')}
          </button>
        ) : (
          <button className="collab-rec-btn" onClick={() => navigate('/login')}>
            <span className="rec-dot" /> {t('events.loginToPost')}
          </button>
        )}
      </div>

      {/* Post form */}
      {formOpen && (
        <section className="collab-studio-form">
          <div className="studio-form-header">
            <span className="studio-form-icon">📅</span>
            <h2>{t('events.postEvent')}</h2>
          </div>
          {formError && <div className="collab-form-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="studio-form-grid">
            <label className="studio-field">
              <span className="studio-field-label">🎤 {t('events.form.title')}</span>
              <input type="text" className="studio-input" value={formData.title} onChange={handleField('title')} placeholder="e.g. Jazz Jam at HaCarmel" />
            </label>
            <label className="studio-field">
              <span className="studio-field-label">🎉 {t('events.form.type')}</span>
              <select className="studio-input studio-select" value={formData.type} onChange={handleField('type')}>
                <option value="">Choose type…</option>
                {EVENT_TYPES.map(tp => <option key={tp} value={tp}>{TYPE_ICONS[tp]} {tp}</option>)}
              </select>
            </label>
            <label className="studio-field">
              <span className="studio-field-label">🎵 {t('events.form.genre')}</span>
              <select className="studio-input studio-select" value={formData.genre} onChange={handleField('genre')}>
                <option value="">Choose genre…</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="studio-field">
              <span className="studio-field-label">📍 {t('events.form.location')}</span>
              <select className="studio-input studio-select" value={formData.location} onChange={handleField('location')}>
                <option value="">Choose location…</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="studio-field">
              <span className="studio-field-label">📅 {t('events.form.date')}</span>
              <input type="date" className="studio-input" value={formData.date} onChange={handleField('date')} />
            </label>
            <label className="studio-field">
              <span className="studio-field-label">🕐 {t('events.form.time')}</span>
              <input type="time" className="studio-input" value={formData.time} onChange={handleField('time')} />
            </label>
            <label className="studio-field studio-field-full">
              <span className="studio-field-label">📝 {t('events.form.description')}</span>
              <textarea className="studio-input studio-textarea" value={formData.description} onChange={handleField('description')} placeholder="Describe the event, who should come, what to bring…" />
            </label>
            <label className="studio-field studio-field-full">
              <span className="studio-field-label">📱 {t('events.form.contact')}</span>
              <input type="text" className="studio-input" value={formData.contact} onChange={handleField('contact')} placeholder="WhatsApp number or email" />
            </label>
            <div className="studio-form-actions">
              <button type="button" className="studio-cancel-btn" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" className="collab-rec-btn"><span className="rec-dot" /> {t('events.form.submit')}</button>
            </div>
          </form>
        </section>
      )}

      {/* Events grid */}
      <div className="events-grid">
        {filtered.length === 0 ? (
          <div className="search-empty">
            <span className="search-empty-icon">📅</span>
            <p>No events match your filters.</p>
          </div>
        ) : (
          filtered.map(ev => {
            const color = TYPE_COLORS[ev.type] || 'var(--music-pink)';
            const past = isPast(ev.date);
            return (
              <div
                key={ev.id}
                className={`event-card ${past ? 'event-card-past' : ''}`}
                style={{ '--ev-color': color }}
              >
                <div className="event-card-top">
                  <span className="event-type-badge" style={{ background: color }}>
                    {TYPE_ICONS[ev.type]} {ev.type}
                  </span>
                  {past && <span className="event-past-label">Past</span>}
                </div>
                <div className="event-avatar">{ev.avatar}</div>
                <h3 className="event-title">{ev.title}</h3>
                <div className="event-meta-row">
                  <span className="event-meta">📅 {formatDate(ev.date)}{ev.time && ` · ${ev.time}`}</span>
                  <span className="event-meta">📍 {ev.location}</span>
                  {ev.genre && <span className="event-meta">🎵 {ev.genre}</span>}
                  {(() => {
                    const prox = proximityLabel(detectedCity, ev.location);
                    if (!prox) return null;
                    const labels = { exact: t('geo.nearYou'), nearby: t('geo.nearby'), remote: t('geo.remote') };
                    return (
                      <span className={`near-you-badge near-you-badge--${prox}`}>
                        {prox === 'exact' ? '📍' : prox === 'remote' ? '🌐' : '🗺️'} {labels[prox]}
                      </span>
                    );
                  })()}
                </div>
                {ev.description && <p className="event-desc">{ev.description}</p>}
                <div className="event-footer">
                  <span className="event-posted-by">Posted by {ev.postedBy}</span>
                  {ev.contact && (
                    <button
                      className="mpc-contact-btn mpc-whatsapp"
                      onClick={() => {
                        const clean = ev.contact.replace(/\D/g, '');
                        if (clean.length >= 9) {
                          window.open(`https://wa.me/${clean}?text=${encodeURIComponent(`Hi! I saw your event "${ev.title}" on LIZI 🎵`)}`, '_blank');
                        } else {
                          window.open(`mailto:${ev.contact}?subject=${encodeURIComponent(`LIZI Event: ${ev.title}`)}`);
                        }
                      }}
                    >
                      📱 Contact
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

export default Events;
