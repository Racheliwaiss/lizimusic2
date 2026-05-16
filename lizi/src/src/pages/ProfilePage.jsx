import './ProfilePage.css';

const userTracks = [
  { id: 1, title: 'Electric Fade',    plays: '4.2K', likes: 87,  duration: '3:21' },
  { id: 2, title: 'Overcast Mind',    plays: '2.8K', likes: 54,  duration: '4:08' },
  { id: 3, title: 'Bloom Protocol',   plays: '6.1K', likes: 134, duration: '3:55' },
];

const stats = [
  { label: 'Tracks',     value: '3'    },
  { label: 'Followers',  value: '284'  },
  { label: 'Following',  value: '91'   },
  { label: 'Total Plays',value: '13.1K'},
];

export default function ProfilePage() {
  return (
    <main className="profile page-wrapper container">

      {/* Profile Header */}
      <div className="profile-header glass">
        <div className="profile-avatar">
          <span className="avatar-icon">◉</span>
        </div>
        <div className="profile-info">
          <div className="profile-badge">Amateur Artist</div>
          <h1 className="profile-name">Nova_Beats</h1>
          <p className="profile-bio">
            Electronic producer from Tel Aviv. Making beats since 2021.
            Into late-night sessions, synths, and strong coffee.
          </p>
          <div className="profile-tags">
            {['Electronic', 'Ambient', 'Lo-Fi'].map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        <button className="btn-primary profile-follow-btn">Follow</button>
      </div>

      {/* Stats Row */}
      <div className="profile-stats">
        {stats.map(s => (
          <div key={s.label} className="profile-stat glass">
            <span className="profile-stat-value">{s.value}</span>
            <span className="profile-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tracks Section */}
      <section className="profile-section">
        <h2 className="section-heading">My Tracks</h2>
        <div className="profile-tracks">
          {userTracks.map((track, i) => (
            <div key={track.id} className="profile-track glass">
              <div className="pt-thumb">
                <span>♪</span>
                <div className="pt-play">▶</div>
              </div>
              <div className="pt-info">
                <span className="pt-title">{track.title}</span>
                <div className="pt-meta">
                  <span>{track.plays} plays</span>
                  <span>·</span>
                  <span>♥ {track.likes}</span>
                  <span>·</span>
                  <span>{track.duration}</span>
                </div>
              </div>
              <button className="pt-options">⋯</button>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="profile-section">
        <h2 className="section-heading">About</h2>
        <div className="about-card glass">
          <div className="about-row">
            <span className="about-label">Location</span>
            <span className="about-value">Tel Aviv, IL</span>
          </div>
          <div className="about-row">
            <span className="about-label">Joined</span>
            <span className="about-value">March 2024</span>
          </div>
          <div className="about-row">
            <span className="about-label">Gear</span>
            <span className="about-value">Ableton 12, Arturia MicroFreak</span>
          </div>
          <div className="about-row">
            <span className="about-label">Open to</span>
            <span className="about-value">Collabs, Remixes, Features</span>
          </div>
        </div>
      </section>
    </main>
  );
}
