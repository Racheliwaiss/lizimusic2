import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import './Layout.css';

function Layout({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">{t('nav.logo')}</Link>
        </div>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>{t('nav.home')}</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>{t('nav.about')}</Link>
          <Link to="/open-stage" className={isActive('/open-stage') ? 'active' : ''}>{t('nav.discover')}</Link>
          <Link to="/search" className={isActive('/search') ? 'active' : ''}>{t('nav.search')}</Link>
          <Link to="/collaboration" className={isActive('/collaboration') ? 'active' : ''}>{t('nav.collaborate')}</Link>
          <Link to="/messages" className={isActive('/messages') ? 'active' : ''}>{t('nav.messages')}</Link>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>{t('nav.profile')}</Link>
        </div>
        <div className="navbar-controls">
          <button className="language-toggle" onClick={toggleLanguage} title="Toggle Language">
            {language === 'en' ? 'עברית' : 'English'}
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
