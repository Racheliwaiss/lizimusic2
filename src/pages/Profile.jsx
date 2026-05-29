import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

function Profile() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [saveError, setSaveError] = useState('');

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
    if (needsProfile) {
      setIsEditing(true);
    }
  }, [user]);

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
            <p className="bio">{profileData.bio || t('profile.bio')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
