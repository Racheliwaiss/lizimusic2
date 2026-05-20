import React from 'react';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Profile() {
  const { t } = useLanguage();

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="profile-avatar">👤</div>
          <h1>{t('profile.artistName')}</h1>
          <p className="bio">{t('profile.bio')}</p>
          <div className="stats">
            <div className="stat">
              <strong>128</strong>
              <span>{t('profile.followers')}</span>
            </div>
            <div className="stat">
              <strong>42</strong>
              <span>{t('profile.following')}</span>
            </div>
            <div className="stat">
              <strong>15</strong>
              <span>{t('profile.collaborations')}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="profile-content">
        <h2>{t('profile.recentWorks')}</h2>
        <div className="works-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="work-card">
              <div className="work-thumbnail">🎵</div>
              <h3>Track {item}</h3>
              <p>{t('profile.collaboration')} • 2 {t('profile.weeksAgo')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Profile;
