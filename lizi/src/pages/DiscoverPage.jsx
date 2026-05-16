import { useState } from 'react';
import './DiscoverPage.css';

const genres = ['All', 'Electronic', 'Chill', 'Rock', 'Ambient', 'Hip-Hop', 'Jazz', 'Pop'];

const allTracks = [
  { id: 1,  title: 'Midnight Circuit',   artist: 'Nova_Beats',   genre: 'Electronic', plays: '12.4K', duration: '3:42', liked: false },
  { id: 2,  title: 'Coastal Dreams',     artist: 'SunWave',      genre: 'Chill',      plays: '8.1K',  duration: '4:15', liked: true  },
  { id: 3,  title: 'Raw Voltage',        artist: 'Ampere_X',     genre: 'Rock',       plays: '5.7K',  duration: '2:58', liked: false },
  { id: 4,  title: 'Soft Horizons',      artist: 'LunaKai',      genre: 'Ambient',    plays: '9.3K',  duration: '6:01', liked: true  },
  { id: 5,  title: 'City Pulse',         artist: 'UrbanFlow',    genre: 'Hip-Hop',    plays: '14.2K', duration: '3:20', liked: false },
  { id: 6,  title: 'Blue Note Theory',   artist: 'JazzCat99',    genre: 'Jazz',       plays: '3.4K',  duration: '5:33', liked: false },
  { id: 7,  title: 'Neon Riff',          artist: 'SynthRider',   genre: 'Electronic', plays: '7.8K',  duration: '4:07', liked: true  },
  { id: 8,  title: 'Late Summer',        artist: 'BeachTones',   genre: 'Pop',        plays: '11.1K', duration: '3:55', liked: false },
];

export default function DiscoverPage() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [likedTracks, setLikedTracks] = useState(
    allTracks.reduce((acc, t) => ({ ...acc, [t.id]: t.liked }), {})
  );

  const filtered = allTracks.filter(t => {
    const matchGenre = activeGenre === 'All' || t.genre === activeGenre;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.artist.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const toggleLike = (id) => setLikedTracks(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="discover page-wrapper container">
      <h1 className="page-title">Discover Music</h1>
      <p className="page-subtitle">Fresh sounds from the LIZI community</p>

      {/* Search */}
      <div className="search-bar glass">
        <span className="search-icon">◎</span>
        <input
          type="text"
          placeholder="Search tracks or artists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Genre filters */}
      <div className="genre-filters">
        {genres.map(g => (
          <button
            key={g}
            className={`genre-chip ${activeGenre === g ? 'active' : ''}`}
            onClick={() => setActiveGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div className="track-list">
        {filtered.length === 0 && (
          <div className="empty-state">No tracks found. Try a different search.</div>
        )}
        {filtered.map((track, i) => (
          <div key={track.id} className="track-row glass">
            <span className="row-index">{String(i + 1).padStart(2, '0')}</span>
            <div className="row-thumb">
              <span className="row-note">♪</span>
              <div className="row-play">▶</div>
            </div>
            <div className="row-info">
              <span className="row-title">{track.title}</span>
              <span className="row-artist">{track.artist}</span>
            </div>
            <span className="row-genre">{track.genre}</span>
            <span className="row-plays">{track.plays}</span>
            <span className="row-duration">{track.duration}</span>
            <button
              className={`row-like ${likedTracks[track.id] ? 'liked' : ''}`}
              onClick={() => toggleLike(track.id)}
              aria-label="Like track"
            >
              {likedTracks[track.id] ? '♥' : '♡'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
