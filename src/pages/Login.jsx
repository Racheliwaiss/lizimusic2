import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import './Pages.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    navigate('/');
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <div className="login-box">
          <h1>🎵 LIZI</h1>
          <h2>{t('login.title')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('login.email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t('login.password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>
            <button type="submit" className="login-button">{t('login.loginBtn')}</button>
          </form>
          <p className="signup-link">
            {t('login.noAccount')} <a href="#signup">{t('login.signup')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
