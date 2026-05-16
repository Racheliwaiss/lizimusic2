import { useState } from 'react';
import './CollabPage.css';

const activeCollabs = [
  {
    id: 1,
    title: 'Neon Desert',
    artists: ['Nova_Beats', 'SynthRider'],
    status: 'In Progress',
    genre: 'Electronic',
    updated: '2h ago',
  },
  {
    id: 2,
    title: 'Monsoon Season',
    artists: ['LunaKai', 'BeachTones', 'UrbanFlow'],
    status: 'Open',
    genre: 'Ambient',
    updated: '1d ago',
  },
];

const openOpportunities = [
  { id: 1, title: 'Looking for a vocalist', artist: 'Ampere_X',   genre: 'Rock',       role: 'Vocalist' },
  { id: 2, title: 'Need drummer samples',   artist: 'Nova_Beats',  genre: 'Electronic', role: 'Drummer'  },
  { id: 3, title: 'Producer collab',        artist: 'JazzCat99',   genre: 'Jazz',       role: 'Producer' },
  { id: 4, title: 'Remix my track',         artist: 'SunWave',     genre: 'Chill',      role: 'Remixer'  },
];

export default function CollabPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="collab page-wrapper container">
      <div className="collab-hero">
        <h1 className="page-title">Collaborate</h1>
        <p className="page-subtitle">Find musicians to create with. Make something together.</p>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '⊕ Post Collab Request'}
        </button>
      </div>

      {/* Post collab form */}
      {showForm && (
        <div className="collab-form glass">
          <h3 className="form-title">New Collaboration Request</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input className="form-input glass" placeholder="e.g. Midnight Session" />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input className="form-input glass" placeholder="e.g. Electronic" />
            </div>
            <div className="form-group">
              <label className="form-label">Looking for</label>
              <input className="form-input glass" placeholder="e.g. Vocalist, Drummer..." />
            </div>
            <div className="form-group form-group--full">
              <label className="form-label">Description</label>
              <textarea className="form-input glass form-textarea" placeholder="Tell artists about your project..." />
            </div>
          </div>
          <button className="btn-primary">Post Request</button>
        </div>
      )}

      {/* Active collabs */}
      <section className="collab-section">
        <h2 className="section-heading">Active Projects</h2>
        <div className="collabs-list">
          {activeCollabs.map(c => (
            <div key={c.id} className="collab-card glass">
              <div className="collab-card-top">
                <span className={`collab-status status--${c.status.toLowerCase().replace(' ', '-')}`}>
                  {c.status}
                </span>
                <span className="collab-genre">{c.genre}</span>
              </div>
              <h3 className="collab-title">{c.title}</h3>
              <div className="collab-artists">
                {c.artists.map(a => (
                  <div key={a} className="collab-avatar" title={a}>
                    {a[0].toUpperCase()}
                  </div>
                ))}
                <span className="collab-artist-names">{c.artists.join(' × ')}</span>
              </div>
              <div className="collab-footer">
                <span className="collab-updated">Updated {c.updated}</span>
                <button className="btn-secondary collab-btn">View Project</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open opportunities */}
      <section className="collab-section">
        <h2 className="section-heading">Open Opportunities</h2>
        <div className="opportunities-grid">
          {openOpportunities.map(o => (
            <div key={o.id} className="opportunity-card glass">
              <div className="opp-role">{o.role}</div>
              <h3 className="opp-title">{o.title}</h3>
              <p className="opp-artist">by {o.artist} · {o.genre}</p>
              <button className="btn-secondary opp-btn">Apply</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
