import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

function Profile() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');

  const profileData = useMemo(() => {
    const metadata = user?.user_metadata || {};
    return {
      name: metadata.name || user?.name || user?.email?.split('@')[0] || '',
      bio: metadata.bio || user?.bio || '',
      about: metadata.about || '',
      favoriteGenres: metadata.favoriteGenres || '',
      instruments: metadata.instruments || '',
      connectAges: metadata.connectAges || '',
      lookingFor: metadata.lookingFor || '',
      createGoals: metadata.createGoals || '',
      musicStyle: metadata.musicStyle || '',
      phone: metadata.phone || user?.phone || '',
    };
  }, [user]);

  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    if (user) {
      setFormData(profileData);
    }
  }, [profileData, user]);

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

  const handleSave = async () => {
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
        <div className="profile-info">
          <div className="profile-avatar">🎵</div>
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder={t('profile.artistName')}
              />
              <input
                type="text"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder={t('profile.bio')}
              />
              <textarea
                name="about"
                value={formData.about || ''}
                onChange={handleChange}
                placeholder={t('profile.aboutPlaceholder')}
                rows={4}
              />
              <input
                type="text"
                name="favoriteGenres"
                value={formData.favoriteGenres || ''}
                onChange={handleChange}
                placeholder={t('profile.favoriteGenres')}
              />
              <input
                type="text"
                name="instruments"
                value={formData.instruments || ''}
                onChange={handleChange}
                placeholder={t('profile.instruments')}
              />
              <input
                type="text"
                name="createGoals"
                value={formData.createGoals || ''}
                onChange={handleChange}
                placeholder={t('profile.createGoals')}
              />
              <input
                type="text"
                name="musicStyle"
                value={formData.musicStyle || ''}
                onChange={handleChange}
                placeholder={t('profile.musicStyle')}
              />
              <input
                type="text"
                name="connectAges"
                value={formData.connectAges || ''}
                onChange={handleChange}
                placeholder={t('profile.connectAges')}
              />
              <input
                type="text"
                name="lookingFor"
                value={formData.lookingFor || ''}
                onChange={handleChange}
                placeholder={t('profile.lookingFor')}
              />
              {saveError && <div className="error-message">{saveError}</div>}
              <div className="edit-buttons">
                <button className="save-btn" onClick={handleSave}>{t('profile.saveChanges')}</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>{t('profile.cancel')}</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{profileData.name}</h1>
              <p className="bio">{profileData.bio || t('profile.bio')}</p>
              {profileData.about ? (
                <p className="about-text">{profileData.about}</p>
              ) : (
                <p className="about-text about-empty">{t('profile.noAboutYet')}</p>
              )}
              <p className="email">📧 {user.email}</p>
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

      <section className="profile-content">
        <h2>{t('profile.recentWorks')}</h2>
        <div className="works-grid">
          {(user.recentWorks || [1, 2, 3, 4]).map((item, index) => (
            <div key={index} className="work-card">
              <div className="work-thumbnail">
                {['🎵', '🎶', '🎤', '🎧'][index % 4]}
              </div>
              <h3>Track {index + 1}</h3>
              <p>{t('profile.collaboration')} • 2 {t('profile.weeksAgo')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Profile;
