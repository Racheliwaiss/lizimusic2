import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { fetchArtists, fetchProjects, fetchAllTracks } from '../lib/db';
import './Pages.css';

const FEED_FILTERS = ['all', 'tracks', 'projects', 'members'];

const SEED_FEED = [
  { id: 's1', type: 'track',   actor: 'Yael Cohen',    content: 'uploaded a new track',  detail: 'Mediterranean Nights',   genre: 'Jazz',       time: 120, avatar: '🎹' },
  { id: 's2', type: 'project', actor: 'Moshe Levy',    content: 'created a new project', detail: 'Desert Blues Collective', genre: 'Blues',      time: 200, avatar: '🎸' },
  { id: 's3', type: 'member',  actor: 'Dana Shamir',   content: 'joined a project',      detail: 'Tel Aviv Electronic',    genre: 'Electronic', time: 340, avatar: '🎧' },
  { id: 's4', type: 'track',   actor: 'Avi Mizrahi',   content: 'uploaded a new track',  detail: 'Sunrise Oud',            genre: 'World',      time: 500, avatar: '🪗' },
  { id: 's5', type: 'project', actor: 'Tamar Ben-Ami', content: 'created a new project', detail: 'Indie Folk Sessions',    genre: 'Folk',       time: 800, avatar: '🎤' },
  { id: 's6', type: 'member',  actor: 'Roni Katz',     content: 'joined a project',      detail: 'Rock Jerusalem',         genre: 'Rock',       time: 1200, avatar: '🥁' },
  { id: 's7', type: 'track',   actor: 'Lior Harpaz',   content: 'uploaded a new track',  detail: 'Shabbat Groove',         genre: 'R&B',        time: 1800, avatar: '🎺' },
  { id: 's8', type: 'project', actor: 'Noa Peretz',    content: 'created a new project', detail: 'Classical Fusion Duo',   genre: 'Classical',  time: 2500, avatar: '🎻' },
];

const TYPE_COLORS = {
  track:   'var(--music-pink)',
  project: 'var(--music-cyan)',
  member:  'var(--music-purple)',
};

const TYPE_ICONS = {
  track:   '🎵',
  project: '🎼',
  member:  '👤',
};

function timeLabel(minutesAgo) {
  if (minutesAgo < 60)  return `${minutesAgo}m ago`;
  const h = Math.floor(minutesAgo / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function minutesAgo(isoString) {
  return Math.max(1, Math.round((Date.now() - new Date(isoString).getTime()) / 60000));
}

function Feed() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [artists, setArtists]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [tracks, setTracks]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([fetchArtists(), fetchProjects(), fetchAllTracks()]).then(([a, p, t]) => {
      setArtists(a);
      setProjects(p);
      setTracks(t);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const dynamicFeed = useMemo(() => {
    const items = [];

    // Real tracks from the community — newest first
    tracks.forEach(t => {
      items.push({
        id:      `t${t.id}`,
        type:    'track',
        actor:   t.uploaderName,
        content: 'uploaded a new track',
        detail:  t.title,
        genre:   t.genre,
        time:    minutesAgo(t.createdAt),
        avatar:  t.uploaderAvatar,
        url:     t.url,
      });
    });

    // Real artists
    artists.slice(0, 4).forEach((a, i) => {
      items.push({
        id:      `a${a.id}`,
        type:    'member',
        actor:   a.name,
        content: 'joined the community',
        detail:  a.genre,
        genre:   a.genre,
        time:    (i + 1) * 180 + 400,
        avatar:  a.avatar || '🎤',
      });
    });

    // Real projects
    projects.slice(0, 4).forEach((p, i) => {
      items.push({
        id:      `p${p.id}`,
        type:    'project',
        actor:   'A musician',
        content: 'created a new project',
        detail:  p.title,
        genre:   p.genre,
        time:    (i + 1) * 250 + 300,
        avatar:  '🎼',
        link:    `/project/${p.id}`,
      });
    });

    return items;
  }, [artists, projects, tracks]);

  const allItems = useMemo(() => {
    const combined = [...dynamicFeed, ...SEED_FEED];
    combined.sort((a, b) => a.time - b.time);
    return combined;
  }, [dynamicFeed]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return allItems;
    const map = { tracks: 'track', projects: 'project', members: 'member' };
    return allItems.filter(i => i.type === map[filter]);
  }, [allItems, filter]);

  return (
    <div className="page feed-page">
      <section className="feed-hero">
        <div className="feed-eq-bars">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="feed-eq-bar" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        <h1 className="feed-hero-title">🎶 {t('feed.title')}</h1>
        <p className="feed-hero-sub">{t('feed.subtitle')}</p>
      </section>

      {/* ── Guest gate ── */}
      {!isAuthenticated ? (
        <div className="feed-guest-gate">
          <span className="feed-guest-icon">🔒</span>
          <h3>Members-only community feed</h3>
          <p>Log in to see tracks, projects, and artists shared by the LIZI community.</p>
          <button className="cta-button" onClick={() => navigate('/login')}>Log in</button>
        </div>
      ) : (
        <>
          <div className="feed-filter-bar">
            {FEED_FILTERS.map(f => (
              <button
                key={f}
                className={`feed-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all'      && '🌐 '}
                {f === 'tracks'   && '🎵 '}
                {f === 'projects' && '🎼 '}
                {f === 'members'  && '👤 '}
                {t(`feed.filter.${f}`)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="collab-loading">
              <div className="collab-loading-bars">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="collab-loading-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p>Loading feed…</p>
            </div>
          ) : (
            <div className="feed-timeline">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="feed-item"
                  style={{ '--feed-color': TYPE_COLORS[item.type], animationDelay: `${idx * 0.04}s` }}
                >
                  <div className="feed-item-left">
                    <div className="feed-avatar">{item.avatar}</div>
                    {idx < filteredItems.length - 1 && <div className="feed-connector" />}
                  </div>
                  <div className="feed-item-body">
                    <div className="feed-item-header">
                      <span className="feed-type-badge" style={{ background: TYPE_COLORS[item.type] }}>
                        {TYPE_ICONS[item.type]} {item.type}
                      </span>
                      <span className="feed-time">{timeLabel(item.time)}</span>
                    </div>
                    <p className="feed-text">
                      <strong className="feed-actor">{item.actor}</strong>{' '}
                      {item.content}
                    </p>
                    {item.detail && (
                      item.link ? (
                        <Link to={item.link} className="feed-detail-link">"{item.detail}"</Link>
                      ) : (
                        <span className="feed-detail">"{item.detail}"</span>
                      )
                    )}
                    {item.genre && <span className="feed-genre-chip">{item.genre}</span>}
                    {item.url && (
                      <audio
                        src={item.url}
                        controls
                        preload="none"
                        className="feed-track-player"
                      />
                    )}
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="search-empty">
                  <span className="search-empty-icon">🎵</span>
                  <p>Nothing here yet — be the first to post!</p>
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="feed-cta-row">
              <Link to="/open-stage" className="cta-button">{t('feed.cta.openStage')}</Link>
              <Link to="/collaboration" className="cta-button" style={{ background: 'rgba(0,217,255,0.15)', borderColor: 'var(--music-cyan)' }}>
                {t('feed.cta.collaborate')}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Feed;
