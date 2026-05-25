import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

function Profile() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    updateProfile(formData);
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
                placeholder="Artist Name"
              />
              <input
                type="text"
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder="Bio"
              />
              <div className="edit-buttons">
                <button className="save-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{user.name || user.email}</h1>
              <p className="bio">{user.bio || t('profile.bio')}</p>
              <p className="email">📧 {user.email}</p>
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
              <button className="edit-btn" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
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
