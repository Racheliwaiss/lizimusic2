import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import UploadTrack from '../components/UploadTrack';
import AvatarUpload from '../components/AvatarUpload';
import { fetchUserTracks, saveTrack, updateTrack, deleteLiziMusic, fetchUserProjects, uploadAvatar, uploadTrackFile } from '../lib/db';
import translations from '../translations';
import './Pages.css';

// English values are always used as option values for consistent data storage.
// Translated labels are used only for display.
const EN = translations.en.dropdowns;

function Profile() {
  const { t } = useLanguage();

  // Translated label arrays (same order as EN arrays)
  const GENRES_LABELS       = t('dropdowns.genres');
  const INSTRUMENTS_LABELS  = t('dropdowns.instruments');
  const MUSIC_STYLES_LABELS = t('dropdowns.musicStyles');
  const AGE_RANGES_LABELS   = t('dropdowns.ageRanges');
  const LOOKING_FOR_LABELS  = t('dropdowns.lookingFor');
  const CREATE_GOALS_LABELS = t('dropdowns.createGoals');
  const LOCATIONS_LABELS    = t('dropdowns.locations');

  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [tracks, setTracks] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

  const profileData = useMemo(() => {
    const metadata = user?.user_metadata || {};
    const userEmail = typeof user?.email === 'string'
      ? user.email
      : typeof user?.email?.email === 'string'
      ? user.email.email
      : '';

    const defaultName = metadata.name || user?.name || (userEmail ? userEmail.split('@')[0] : '');

    return {
      name: defaultName,
      bio: metadata.bio || user?.bio || '',
      about: metadata.about || '',
      favoriteGenres: metadata.favoriteGenres || '',
      instruments: metadata.instruments || '',
      connectAges: metadata.connectAges || '',
      lookingFor: metadata.lookingFor || '',
      createGoals: metadata.createGoals || '',
      musicStyle: metadata.musicStyle || '',
      phone:    metadata.phone    || user?.phone || '',
      facebook: metadata.facebook || '',
      location: metadata.location || '',
      email: userEmail,
    };
  }, [user]);

  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    if (user) {
      setFormData(profileData);
    }
  }, [profileData, user]);

  useEffect(() => {
    if (!user) return;
    const metadata = user.user_metadata || {};
    const needsProfile = !metadata.about && !metadata.favoriteGenres && !metadata.instruments && !metadata.createGoals && !metadata.musicStyle && !metadata.connectAges && !metadata.lookingFor;
    if (needsProfile) setIsEditing(true);
  }, [user]);

  // Sync avatar URL whenever the user object updates (e.g. after updateProfile)
  useEffect(() => {
    const url = user?.user_metadata?.avatar_url;
    if (url) setAvatarUrl(url);
  }, [user?.user_metadata?.avatar_url]);

  // Load tracks and user's projects from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    fetchUserTracks(user.id).then(setTracks);
    fetchUserProjects(user.id).then(setMyProjects);
  }, [user?.id]);

  const refreshTracks = () => fetchUserTracks(user.id).then(setTracks);

  const handleAvatarUpload = async (file) => {
    const { url, error } = await uploadAvatar(user.id, file);
    if (url) {
      setAvatarUrl(url);
      await updateProfile({ avatar_url: url });
    }
    return { url, error };
  };

  const handleUpload = async (track) => {
    if (track._isEdit) {
      // Persist metadata (+ new file URL if a new file was uploaded)
      await updateTrack(track.id, {
        title:    track.title,
        genre:    track.genre,
        fileUrl:  track.url      || undefined,
        fileName: track.fileName || undefined,
      });
      setTracks(prev =>
        prev.map(t => t.id === track.id
          ? { ...t, title: track.title, genre: track.genre, url: track.url, fileName: track.fileName }
          : t
        )
      );
    } else {
      // Persist new track row with storage URL
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

  const trackUploadFn = (file) => uploadTrackFile(user.id, file);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteLiziMusic(deleteTarget.id);
    setTracks(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="page profile-page">
        <div className="profile-header">
          <div className="profile-banner"></div>
          <div className="profile-info">
            <div className="profile-avatar">👤</div>
            <h1>Not Logged In</h1>
            <p className="bio">Please login to view your profile</p>
            <button className="login-button" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    const result = await logout();
    if (!result.error) {
      navigate('/login');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setSaveError('');
    const updates = {
      name: formData.name,
      bio: formData.bio,
      about: formData.about,
      favoriteGenres: formData.favoriteGenres,
      instruments: formData.instruments,
      connectAges: formData.connectAges,
      lookingFor: formData.lookingFor,
      createGoals: formData.createGoals,
      musicStyle: formData.musicStyle,
      phone:    formData.phone,
      facebook: formData.facebook,
      location: formData.location,
    };

    const result = await updateProfile(updates);
    if (result.error) {
      setSaveError(result.error);
      return;
    }

    setIsEditing(false);
  };

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div className="profile-banner">
          <div className="banner-decoration">🎵</div>
          <div className="banner-decoration">🎶</div>
          <div className="banner-decoration">🎵</div>
        </div>
        <div className="profile-card">
          <div className="profile-info">
            <AvatarUpload
              currentUrl={avatarUrl}
              onUpload={handleAvatarUpload}
            />
            <h1>{profileData.name || t('profile.artistName')}</h1>
            {isEditing ? (
              <form className="edit-form" onSubmit={handleSave}>
                <label>
                  {t('profile.artistName')}
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder={t('profile.artistName')}
                    required
                  />
                </label>
                <label>
                  {t('profile.bio')}
                  <input
                    type="text"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder={t('profile.bio')}
                  />
                </label>
                <label>
                  {t('profile.aboutPlaceholder')}
                  <textarea
                    name="about"
                    value={formData.about || ''}
                    onChange={handleChange}
                    placeholder={t('profile.aboutPlaceholder')}
                    rows={4}
                  />
                </label>
                <label>
                  {t('profile.favoriteGenres')}
                  <select name="favoriteGenres" value={formData.favoriteGenres || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectGenre')}</option>
                    {EN.genres.map((g, i) => <option key={g} value={g}>{Array.isArray(GENRES_LABELS) ? GENRES_LABELS[i] || g : g}</option>)}
                  </select>
                </label>
                <label>
                  {t('profile.instruments')}
                  <select name="instruments" value={formData.instruments || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectInstrument')}</option>
                    {EN.instruments.map((inst, i) => <option key={inst} value={inst}>{Array.isArray(INSTRUMENTS_LABELS) ? INSTRUMENTS_LABELS[i] || inst : inst}</option>)}
                  </select>
                </label>
                <label>
                  {t('profile.createGoals')}
                  <select name="createGoals" value={formData.createGoals || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectGoal')}</option>
                    {EN.createGoals.map((g, i) => <option key={g} value={g}>{Array.isArray(CREATE_GOALS_LABELS) ? CREATE_GOALS_LABELS[i] || g : g}</option>)}
                  </select>
                </label>
                <label>
                  {t('profile.musicStyle')}
                  <select name="musicStyle" value={formData.musicStyle || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectStyle')}</option>
                    {EN.musicStyles.map((s, i) => <option key={s} value={s}>{Array.isArray(MUSIC_STYLES_LABELS) ? MUSIC_STYLES_LABELS[i] || s : s}</option>)}
                  </select>
                </label>
                <label>
                  📍 {t('profile.location')}
                  <select name="location" value={formData.location || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectLocation')}</option>
                    {EN.locations.map((l, i) => <option key={l} value={l}>{Array.isArray(LOCATIONS_LABELS) ? LOCATIONS_LABELS[i] || l : l}</option>)}
                  </select>
                </label>
                <label>
                  {t('profile.connectAges')}
                  <select name="connectAges" value={formData.connectAges || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectAgeRange')}</option>
                    {EN.ageRanges.map((a, i) => <option key={a} value={a}>{Array.isArray(AGE_RANGES_LABELS) ? AGE_RANGES_LABELS[i] || a : a}</option>)}
                  </select>
                </label>
                <label>
                  {t('profile.lookingFor')}
                  <select name="lookingFor" value={formData.lookingFor || ''} onChange={handleChange} className="edit-select">
                    <option value="">{t('dropdowns.selectLookingFor')}</option>
                    {EN.lookingFor.map((lf, i) => <option key={lf} value={lf}>{Array.isArray(LOOKING_FOR_LABELS) ? LOOKING_FOR_LABELS[i] || lf : lf}</option>)}
                  </select>
                </label>
                <label>
                  📱 WhatsApp / Phone
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+972 50 000 0000"
                  />
                </label>
                <label>
                  🔵 Facebook Profile URL
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourname"
                  />
                </label>
                {saveError && <div className="error-message">{saveError}</div>}
                <div className="edit-buttons">
                  <button className="save-btn" type="submit">{t('profile.saveChanges')}</button>
                  <button className="cancel-btn" type="button" onClick={() => setIsEditing(false)}>{t('profile.cancel')}</button>
                </div>
              </form>
            ) : (
              <>
                <p className="bio">{profileData.bio || t('profile.bio')}</p>
                {profileData.about ? (
                  <p className="about-text">{profileData.about}</p>
                ) : (
                  <p className="about-text about-empty">{t('profile.noAboutYet')}</p>
                )}
                <p className="email">📧 {profileData.email}</p>
                <div className="profile-details">
                  <p><strong>{t('profile.favoriteGenres')}:</strong> {profileData.favoriteGenres || t('profile.noPreference')}</p>
                  <p><strong>{t('profile.instruments')}:</strong> {profileData.instruments || t('profile.noPreference')}</p>
                  <p><strong>{t('profile.createGoals')}:</strong> {profileData.createGoals || t('profile.noPreference')}</p>
                  <p><strong>{t('profile.musicStyle')}:</strong> {profileData.musicStyle || t('profile.noPreference')}</p>
                  <p><strong>{t('profile.connectAges')}:</strong> {profileData.connectAges || t('profile.noPreference')}</p>
                  <p><strong>{t('profile.lookingFor')}:</strong> {profileData.lookingFor || t('profile.noPreference')}</p>
                </div>
              </>
            )}

            <div className="stats">
              <div className="stat">
                <strong>{user?.user_metadata?.followers || 0}</strong>
                <span>{t('profile.followers')}</span>
              </div>
              <div className="stat">
                <strong>{user?.user_metadata?.following || 0}</strong>
                <span>{t('profile.following')}</span>
              </div>
              <div className="stat">
                <strong>{myProjects.length}</strong>
                <span>{t('profile.collaborations')}</span>
              </div>
            </div>

            <div className="profile-actions">
              {!isEditing && (
                <>
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                  <button
                    className="whatsapp-btn-profile"
                    onClick={() => {
                      const phone = user?.user_metadata?.phone || user.phone || '';
                      if (!phone) return;
                      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
                    }}
                    style={!user?.user_metadata?.phone && !user?.phone ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    title={user?.user_metadata?.phone ? 'Open WhatsApp' : 'Add phone number to enable'}
                  >
                    💬 WhatsApp
                  </button>
                  {user?.user_metadata?.facebook && (
                    <button
                      className="facebook-btn-profile"
                      onClick={() => window.open(user.user_metadata.facebook, '_blank')}
                    >
                      🔵 Facebook
                    </button>
                  )}
                </>
              )}
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <section className="profile-content">
        <div className="works-header">
          <h2>{t('profile.recentWorks')}</h2>
          <button className="upload-track-btn" onClick={() => setShowUpload(true)}>
            + {t('upload.uploadBtn')}
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="no-tracks">
            <div className="no-tracks-icon">🎵</div>
            <p>{t('upload.noTracksYet')}</p>
            <button className="save-btn" onClick={() => setShowUpload(true)}>
              {t('upload.uploadFirst')}
            </button>
          </div>
        ) : (
          <div className="works-grid">
            {tracks.map((track) => (
              <div key={track.id} className="work-card track-card">
                <div className="work-thumbnail">🎵</div>
                <h3 className="track-title">{track.title}</h3>
                {track.genre && <p className="track-genre">{track.genre}</p>}
                {track.url && <audio className="track-player" controls src={track.url} />}
                <div className="track-actions">
                  <button className="track-edit-btn" onClick={() => setEditingTrack(track)}>
                    ✏️ {t('upload.editTitle')}
                  </button>
                  <button className="track-delete-btn" onClick={() => setDeleteTarget(track)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Projects */}
      <section className="profile-content my-projects-section">
        <div className="works-header">
          <h2>🎼 My Projects</h2>
          <a href="/collaboration" className="upload-track-btn" style={{ textDecoration: 'none' }}>
            + New Project
          </a>
        </div>

        {myProjects.length === 0 ? (
          <div className="no-tracks">
            <div className="no-tracks-icon">🎼</div>
            <p>No projects created yet.</p>
            <a href="/collaboration" className="save-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Create your first project
            </a>
          </div>
        ) : (
          <div className="my-projects-grid">
            {myProjects.map((project) => (
              <div key={project.id} className="my-project-card">
                <div className="my-project-icon">🎼</div>
                <div className="my-project-info">
                  <h3>{project.title}</h3>
                  <p className="my-project-genre">{project.genre}</p>
                  {project.instruments && (
                    <p className="my-project-instruments">🎸 {project.instruments}</p>
                  )}
                  {project.location && (
                    <p className="my-project-instruments">📍 {project.location}</p>
                  )}
                  {project.description && (
                    <p className="my-project-desc">{project.description}</p>
                  )}
                </div>
                <div className="my-project-meta">
                  <span className="my-project-members">👥 {project.members} members</span>
                  {project.ageRange && <span className="my-project-age">Ages {project.ageRange}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upload new track */}
      {showUpload && (
        <UploadTrack
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
          uploadFn={trackUploadFn}
        />
      )}

      {/* Edit existing track */}
      {editingTrack && (
        <UploadTrack
          initialData={editingTrack}
          onUpload={handleUpload}
          onClose={() => setEditingTrack(null)}
          uploadFn={trackUploadFn}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
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

export default Profile;
