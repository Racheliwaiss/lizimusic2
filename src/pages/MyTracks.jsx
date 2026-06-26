import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import UploadTrack from '../components/UploadTrack';
import { fetchUserTracks, saveTrack, updateTrack, deleteLiziMusic, uploadTrackFile } from '../lib/db';
import './Pages.css';

const GENRES = ['Pop','Rock','Jazz','Hip-Hop','Electronic','R&B','Folk','Classical','World','Reggae','Other'];

const GENRE_COLORS = {
  'Pop': '#FF006E', 'Rock': '#FF4500', 'Jazz': '#FFD700', 'Hip-Hop': '#9B59B6',
  'Electronic': '#00D9FF', 'R&B': '#FF69B4', 'Folk': '#90EE90', 'Classical': '#DDA0DD',
  'World': '#FFA500', 'Reggae': '#00FF7F', 'Other': '#8A2BE2',
};

function fmtDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function TrackRow({ track, index, onEdit, onDelete, playing, onPlay }) {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [progress, setProgress] = useState(0);
  const isPlaying = playing === track.id;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    setProgress((el.currentTime / el.duration) * 100);
  };

  const handleSeek = (e) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.currentTime = pct * el.duration;
  };

  const genreColor = GENRE_COLORS[track.genre] || '#8A2BE2';

  return (
    <div className={`mt-row ${isPlaying ? 'mt-row--playing' : ''}`} style={{ '--mt-color': genreColor }}>
      <span className="mt-row-num">{String(index + 1).padStart(2, '0')}</span>

      <button
        className="mt-play-btn"
        onClick={() => onPlay(isPlaying ? null : track.id)}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={!track.url}
        title={!track.url ? 'No audio file' : undefined}
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        )}
      </button>

      <div className="mt-row-info">
        <span className="mt-row-title">{track.title}</span>
        {track.genre && (
          <span className="mt-row-genre" style={{ background: genreColor + '22', color: genreColor, border: `1px solid ${genreColor}44` }}>
            {track.genre}
          </span>
        )}
      </div>

      {track.url && (
        <div className="mt-progress-wrap" onClick={handleSeek} title="Seek">
          <div className="mt-progress-bar">
            <div className="mt-progress-fill" style={{ width: `${progress}%`, background: genreColor }} />
          </div>
          <audio
            ref={audioRef}
            src={track.url}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { onPlay(null); setProgress(0); }}
            preload="metadata"
          />
        </div>
      )}

      <span className="mt-row-duration">{fmtDuration(duration)}</span>

      <div className="mt-row-actions">
        <button className="mt-action-btn mt-edit-btn" onClick={() => onEdit(track)} title="Edit">
          ✏️
        </button>
        <button className="mt-action-btn mt-delete-btn" onClick={() => onDelete(track)} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
}

function MyTracks() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tracks, setTracks]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showUpload, setShowUpload]   = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [playingId, setPlayingId]     = useState(null);
  const [filterGenre, setFilterGenre] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchUserTracks(user.id).then(data => {
      setTracks(data);
      setLoading(false);
    });
  }, [user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="page mt-page">
        <div className="mt-login-prompt">
          <div className="mt-login-icon">🎵</div>
          <h2>Sign in to see your tracks</h2>
          <button className="cta-button" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  const trackUploadFn = (file) => uploadTrackFile(user.id, file);

  const handleUpload = async (track) => {
    if (track._isEdit) {
      await updateTrack(track.id, {
        title:    track.title,
        genre:    track.genre,
        fileUrl:  track.url      || undefined,
        fileName: track.fileName || undefined,
        userId:   user.id,
      });
      setTracks(prev =>
        prev.map(t => t.id === track.id
          ? { ...t, title: track.title, genre: track.genre, url: track.url, fileName: track.fileName }
          : t)
      );
    } else {
      const { track: saved } = await saveTrack({
        userId:   user.id,
        title:    track.title,
        genre:    track.genre,
        fileUrl:  track.url,
        fileName: track.fileName,
      });
      setTracks(prev => [saved || track, ...prev]);
    }
    setEditingTrack(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteLiziMusic(deleteTarget.id, user.id);
    setTracks(prev => prev.filter(t => t.id !== deleteTarget.id));
    if (playingId === deleteTarget.id) setPlayingId(null);
    setDeleteTarget(null);
  };

  const visible = filterGenre
    ? tracks.filter(t => t.genre === filterGenre)
    : tracks;

  const usedGenres = [...new Set(tracks.map(t => t.genre).filter(Boolean))];

  return (
    <div className="page mt-page">

      {/* Hero */}
      <section className="mt-hero">
        <div className="feed-eq-bars">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="feed-eq-bar" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        <h1 className="mt-hero-title">🎵 My Tracks</h1>
        <p className="mt-hero-sub">Your personal music library</p>
      </section>

      {/* Stats + Upload bar */}
      <div className="mt-toolbar">
        <div className="mt-stats">
          <span className="mt-stat"><strong>{tracks.length}</strong> tracks</span>
        </div>

        <div className="mt-filters">
          {usedGenres.length > 0 && (
            <select
              className="genre-filter-dropdown"
              value={filterGenre}
              onChange={e => setFilterGenre(e.target.value)}
            >
              <option value="">🎵 All Genres</option>
              {usedGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          {filterGenre && (
            <button className="studio-cancel-btn" onClick={() => setFilterGenre('')}>✕ Clear</button>
          )}
        </div>

        <button className="collab-rec-btn" onClick={() => setShowUpload(true)}>
          <span className="rec-dot" /> + Upload Track
        </button>
      </div>

      {/* Track list */}
      {loading ? (
        <div className="mt-loading">
          <div className="mt-loading-bars">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mt-loading-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <p>Loading your tracks…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-empty">
          <div className="mt-empty-vinyl">🎧</div>
          <h3>{tracks.length === 0 ? 'No tracks yet' : 'No tracks match this genre'}</h3>
          <p>{tracks.length === 0
            ? 'Upload your first track and start building your library.'
            : 'Try a different genre filter or clear it to see all your tracks.'
          }</p>
          {tracks.length === 0 && (
            <button className="cta-button" onClick={() => setShowUpload(true)}>
              🎵 Upload Your First Track
            </button>
          )}
        </div>
      ) : (
        <div className="mt-list">
          <div className="mt-list-header">
            <span className="mt-lh-num">#</span>
            <span />
            <span className="mt-lh-title">Title</span>
            <span className="mt-lh-progress">Progress</span>
            <span className="mt-lh-dur">Duration</span>
            <span className="mt-lh-actions" />
          </div>
          {visible.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              playing={playingId}
              onPlay={setPlayingId}
              onEdit={setEditingTrack}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadTrack
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
          uploadFn={trackUploadFn}
        />
      )}

      {/* Edit modal */}
      {editingTrack && (
        <UploadTrack
          initialData={editingTrack}
          onUpload={handleUpload}
          onClose={() => setEditingTrack(null)}
          uploadFn={trackUploadFn}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="upload-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="delete-dialog">
            <h3>🗑️ {t('upload.confirmDelete')}</h3>
            <p className="delete-track-name">"{deleteTarget.title}"</p>
            <p className="delete-warning">{t('upload.confirmDeleteMsg')}</p>
            <div className="upload-actions">
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>
                {t('upload.deleteCancel')}
              </button>
              <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>
                {t('upload.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTracks;
