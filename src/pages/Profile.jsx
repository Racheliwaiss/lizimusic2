import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import UploadTrack from '../components/UploadTrack';
import { fetchUserTracks, saveTrack, updateTrack, deleteLiziMusic, fetchUserProjects } from '../lib/db';
import './Pages.css';

function Profile() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [tracks, setTracks] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [myProjects, setMyProjects] = useState([]);

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
      phone: metadata.phone || user?.phone || '',
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

  // Load tracks and user's projects from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    fetchUserTracks(user.id).then(setTracks);
    fetchUserProjects(user.id).then(setMyProjects);
  }, [user?.id]);

  const refreshTracks = () => fetchUserTracks(user.id).then(setTracks);

  const handleUpload = async (track) => {
    if (track._isEdit) {
      // Update metadata in DB, then refresh
      await updateTrack(track.id, { title: track.title, genre: track.genre });
      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, title: track.title, genre: track.genre, url: track.url, fileName: track.fileName } : t));
    } else {
      // Save new track to DB
      const { track: saved } = await saveTrack({
        userId: user.id,
        title: track.title,
        genre: track.genre,
        fileUrl: track.url,
        fileName: track.fileName,
      });
      // Use saved DB row if available, otherwise use local object
      setTracks(prev => [saved || track, ...prev]);
    }
    setEditingTrack(null);
  };

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
      phone: formData.phone,
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
            <div className="profile-avatar">🎵</div>
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
                  <input
                    type="text"
                    name="favoriteGenres"
                    value={formData.favoriteGenres || ''}
                    onChange={handleChange}
                    placeholder={t('profile.favoriteGenres')}
                  />
                </label>
                <label>
                  {t('profile.instruments')}
                  <input
                    type="text"
                    name="instruments"
                    value={formData.instruments || ''}
                    onChange={handleChange}
                    placeholder={t('profile.instruments')}
                  />
                </label>
                <label>
                  {t('profile.createGoals')}
                  <input
                    type="text"
                    name="createGoals"
                    value={formData.createGoals || ''}
                    onChange={handleChange}
                    placeholder={t('profile.createGoals')}
                  />
                </label>
                <label>
                  {t('profile.musicStyle')}
                  <input
                    type="text"
                    name="musicStyle"
                    value={formData.musicStyle || ''}
                    onChange={handleChange}
                    placeholder={t('profile.musicStyle')}
                  />
                </label>
                <label>
                  {t('profile.connectAges')}
                  <input
                    type="text"
                    name="connectAges"
                    value={formData.connectAges || ''}
                    onChange={handleChange}
                    placeholder={t('profile.connectAges')}
                  />
                </label>
                <label>
                  {t('profile.lookingFor')}
                  <input
                    type="text"
                    name="lookingFor"
                    value={formData.lookingFor || ''}
                    onChange={handleChange}
                    placeholder={t('profile.lookingFor')}
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
                <strong>{user.followers || 0}</strong>
                <span>{t('profile.followers')}</span>
              </div>
              <div className="stat">
                <strong>{user.following || 0}</strong>
                <span>{t('profile.following')}</span>
              </div>
              <div className="stat">
                <strong>{user.collaborations || 0}</strong>
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
                      const phone = user.phone || '+1234567890';
                      const cleanPhone = phone.replace(/\D/g, '');
                      window.open(`https://wa.me/${cleanPhone}`, '_blank');
                    }}
                  >
                    💬 WhatsApp
                  </button>
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
        />
      )}

      {/* Edit existing track */}
      {editingTrack && (
        <UploadTrack
          initialData={editingTrack}
          onUpload={handleUpload}
          onClose={() => setEditingTrack(null)}
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
