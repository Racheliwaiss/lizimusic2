import { Link } from 'react-router-dom';
import './LandingPage.css';

const featuredTracks = [
  { id: 1, title: 'Midnight Circuit', artist: 'Nova_Beats', genre: 'Electronic', plays: '12.4K', color: '#E0FF4F' },
  { id: 2, title: 'Coastal Dreams',   artist: 'SunWave',    genre: 'Chill',       plays: '8.1K',  color: '#c8c6c5' },
  { id: 3, title: 'Raw Voltage',      artist: 'Ampere_X',   genre: 'Rock',        plays: '5.7K',  color: '#ffffff' },
  { id: 4, title: 'Soft Horizons',    artist: 'LunaKai',    genre: 'Ambient',     plays: '9.3K',  color: '#c4c7c8' },
];

const stats = [
  { value: '18K+', label: 'Artists' },
  { value: '94K+', label: 'Tracks' },
  { value: '2.1M', label: 'Plays' },
  { value: '340+', label: 'Collabs' },
];

export default function LandingPage() {
  return (
    <main className="landing page-wrapper">

      {/* === HERO === */}
      <section className="hero container">
        <div className="hero-badge">
          <span className="badge-dot" />
          Platform for Amateur Musicians
        </div>
        <h1 className="hero-title">
          Your music.<br />
          <span className="hero-accent">Heard.</span>
        </h1>
        <p className="hero-subtitle">
          LIZI is where emerging artists create, collaborate, and share music with a community that gets it.
        </p>
        <div className="hero-cta">
          <Link to="/discover" className="btn-primary">Explore Music</Link>
          <Link to="/collab" className="btn-secondary">Start Collaborating</Link>
        </div>

        {/* Floating audio visual */}
        <div className="hero-visual">
          <div className="waveform">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{ '--delay': `${i * 0.05}s`, '--h': `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
          <div className="hero-now-playing glass">
            <div className="np-disc">♪</div>
            <div className="np-info">
              <span className="np-track">Midnight Circuit</span>
              <span className="np-artist">Nova_Beats</span>
            </div>
            <div className="np-live">LIVE</div>
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section className="stats-strip glass container-wide">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* === FEATURED TRACKS === */}
      <section className="featured container">
        <div className="section-header">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/discover" className="section-link">See all →</Link>
        </div>

        <div className="tracks-grid">
          {featuredTracks.map((track, i) => (
            <div key={track.id} className="track-card glass" style={{ '--accent': track.color }}>
              <div className="track-thumb">
                <span className="track-note">♪</span>
                <div className="track-play-btn">▶</div>
              </div>
              <div className="track-info">
                <span className="track-genre">{track.genre}</span>
                <h3 className="track-title">{track.title}</h3>
                <span className="track-artist">by {track.artist}</span>
              </div>
              <div className="track-plays">{track.plays} plays</div>
            </div>
          ))}
        </div>
      </section>

      {/* === CTA BANNER === */}
      <section className="cta-banner container">
        <div className="cta-inner glass">
          <h2 className="cta-title">Ready to be heard?</h2>
          <p className="cta-text">Join thousands of musicians already sharing their sound on LIZI.</p>
          <Link to="/profile" className="btn-primary">Create Your Profile</Link>
        </div>
      </section>
    </main>
  );
}
