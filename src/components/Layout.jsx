import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { useGeoContext } from '../GeoContext';
import { supabase } from '../lib/supabase';
import './Layout.css';
import './LocationDetector.css';

function Layout({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const profileRef = useRef(null);
  const connectTimer = useRef(null);

  const { language, toggleLanguage, t } = useLanguage();
  const { city: geoCity, status: geoStatus, detect: geoDetect, clear: geoClear } = useGeoContext();
  const [geoDismissed, setGeoDismissed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    try { await supabase.auth.signOut(); } catch {}
    navigate('/');
  };

  const goTo = (path) => { setProfileOpen(false); navigate(path); };

  const openConnect = () => { clearTimeout(connectTimer.current); setConnectOpen(true); };
  const closeConnect = () => { connectTimer.current = setTimeout(() => setConnectOpen(false), 150); };

  const isActive = (path) => location.pathname === path;

  const displayName = user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Profile';

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">{t('nav.logo')}</Link>
        </div>

        <div className="nav-links">
          <Link to="/feed"          className={isActive('/feed')           ? 'active' : ''}>{t('nav.feed')}</Link>
          <Link to="/open-stage"    className={isActive('/open-stage')     ? 'active' : ''}>{t('nav.discover')}</Link>
          <Link to="/search"        className={isActive('/search')         ? 'active' : ''}>{t('nav.search')}</Link>
          <div
            className="nav-dropdown-wrap"
            onMouseEnter={openConnect}
            onMouseLeave={closeConnect}
          >
            <span
              className={`nav-link-btn ${(isActive('/collaboration') || isActive('/find-bandmate')) ? 'active' : ''}`}
            >
              {t('nav.connectCollaborate')} <span className="nav-chevron-small">▾</span>
            </span>
            {connectOpen && (
              <div className="nav-dropdown nav-dropdown-wide" onMouseEnter={openConnect} onMouseLeave={closeConnect}>
                <p className="nav-dropdown-section-label">{t('nav.collaborate')}</p>
                <Link to="/collaboration" className="nav-dropdown-item" onClick={() => setConnectOpen(false)}>
                  🎼 {t('nav.collaborateMenu.browseProjects')}
                </Link>
                <Link to="/collaboration" className="nav-dropdown-item" onClick={() => setConnectOpen(false)}>
                  ➕ {t('nav.collaborateMenu.createProject')}
                </Link>
                <Link to="/profile" className="nav-dropdown-item" onClick={() => setConnectOpen(false)}>
                  👤 {t('nav.collaborateMenu.myProjects')}
                </Link>
                <div className="nav-dropdown-divider" />
                <p className="nav-dropdown-section-label">{t('nav.findBandmate')}</p>
                <Link to="/find-bandmate" className="nav-dropdown-item" onClick={() => setConnectOpen(false)}>
                  🥁 {t('nav.bandmateMenu.browseListings')}
                </Link>
                <Link to="/find-bandmate" className="nav-dropdown-item" onClick={() => setConnectOpen(false)}>
                  📋 {t('nav.bandmateMenu.postListing')}
                </Link>
                <Link to="/search" className="nav-dropdown-item" onClick={() => setConnectOpen(false)}>
                  🔍 {t('nav.bandmateMenu.searchMusicians')}
                </Link>
              </div>
            )}
          </div>
          <Link to="/events"        className={isActive('/events')         ? 'active' : ''}>{t('nav.events')}</Link>
          <Link to="/messages"      className={isActive('/messages')       ? 'active' : ''}>{t('nav.messages')}</Link>
          <Link to="/about"         className={isActive('/about')          ? 'active' : ''}>{t('nav.about')}</Link>
          <Link to="/contact"       className={isActive('/contact')        ? 'active' : ''}>{t('nav.contact')}</Link>
          <Link to="/memorial"      className={isActive('/memorial')       ? 'active' : ''}>{t('nav.memorial')}</Link>
          <Link to="/"              className={isActive('/')               ? 'active' : ''}>{t('nav.home')}</Link>
        </div>

        <div className="navbar-controls">
          <button className="language-toggle" onClick={toggleLanguage} title="Toggle Language">
            {language === 'en' ? 'עברית' : 'English'}
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="profile-dropdown-wrap" ref={profileRef}>
              <button
                className={`profile-trigger ${profileOpen ? 'open' : ''}`}
                onClick={() => setProfileOpen(v => !v)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="nav-avatar-img" />
                ) : (
                  <span className="nav-avatar-emoji">🎵</span>
                )}
                <span className="nav-display-name">{displayName}</span>
                <span className={`nav-chevron ${profileOpen ? 'up' : ''}`}>▾</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{displayName}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => goTo('/profile')}>
                    👤 View Profile
                  </button>
                  <button className="dropdown-item" onClick={() => goTo('/profile')}>
                    🎵 My Tracks
                  </button>
                  <button className="dropdown-item" onClick={() => goTo('/collaboration')}>
                    🎼 My Projects
                  </button>
                  <button className="dropdown-item" onClick={() => goTo('/messages')}>
                    💬 Messages
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="logout-btn" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* ── Geo banner (global, below navbar) ── */}
      {!geoDismissed && geoStatus !== 'unsupported' && geoStatus !== 'denied' && (
        <div className="geo-bar-wrap">
          {geoStatus === 'success' && geoCity ? (
            <div className="geo-banner geo-banner--active">
              <span className="geo-banner-icon">📍</span>
              <span className="geo-banner-text">
                {t('geo.showingNear')} <strong>{geoCity}</strong>
              </span>
              <button className="geo-banner-change" onClick={geoDetect}>{t('geo.change')}</button>
              <button className="geo-banner-dismiss" onClick={() => { geoClear(); setGeoDismissed(true); }} aria-label="Dismiss">✕</button>
            </div>
          ) : geoStatus === 'loading' ? (
            <div className="geo-banner geo-banner--loading">
              <span className="geo-banner-dot" />
              <span className="geo-banner-text">{t('geo.detecting')}</span>
            </div>
          ) : (
            <div className="geo-banner geo-banner--prompt">
              <span className="geo-banner-icon">📍</span>
              <span className="geo-banner-text">{t('geo.prompt')}</span>
              <button className="geo-banner-cta" onClick={geoDetect} disabled={geoStatus === 'loading'}>
                {t('geo.useLocation')}
              </button>
              <button className="geo-banner-dismiss" onClick={() => setGeoDismissed(true)} aria-label="Dismiss">✕</button>
            </div>
          )}
        </div>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
