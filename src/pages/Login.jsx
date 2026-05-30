import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import './Pages.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );
  const [googleReady, setGoogleReady] = useState(false);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const showGoogleButton = Boolean(GOOGLE_CLIENT_ID);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signUp, signIn, user } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Redirect to profile if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Handle Google Login
  const handleGoogleLogin = useCallback((response) => {
    if (response?.credential) {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const userData = JSON.parse(jsonPayload);
        console.log('Google user data', userData);
        setError('Google OAuth integration coming soon');
      } catch (err) {
        setError('Google login failed. Please try again.');
      }
    }
  }, []);

  // Load Google Sign-In script only when a client ID is configured.
  useEffect(() => {
    if (!showGoogleButton) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setGoogleReady(false);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      setGoogleReady(false);
    };
  }, [showGoogleButton]);

  useEffect(() => {
    if (!googleReady || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-button'),
      { theme: 'outline', size: 'large', text: 'signup_with' }
    );
  }, [googleReady, handleGoogleLogin, GOOGLE_CLIENT_ID]);

  const normalizeError = (errorValue) => {
    if (!errorValue) return 'An unknown error occurred.';
    if (typeof errorValue === 'string') return errorValue;
    if (errorValue?.message) return errorValue.message;
    return JSON.stringify(errorValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isSignup && !name) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (isSignup) {
        result = await signUp(email, password, {
          name: name || email.split('@')[0],
          bio: '🎵 Music Creator',
        });
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(normalizeError(result.error));
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate('/');
    } catch (err) {
      setError(normalizeError(err));
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <button className="login-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="login-container">
        <div className="login-box">
          <h1>🎵 LIZI</h1>
          <h2>{isSignup ? 'Sign Up' : t('login.title')}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required={isSignup}
                />
              </div>
            )}
            
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
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Loading...' : (isSignup ? 'Sign Up' : t('login.loginBtn'))}
            </button>
          </form>

          <div className="divider">
            <span>{t('login.orContinueWith')}</span>
          </div>

          {showGoogleButton ? (
            <div className="oauth-buttons">
              <div id="google-button"></div>
            </div>
          ) : (
            <div className="oauth-disabled-note">
              Google sign-in is disabled until a Google Client ID is configured.
            </div>
          )}
          
          <p className="signup-link">
            {isSignup ? (
              <>
                {t('login.noAccount')} <a href="#login" onClick={() => setIsSignup(false)}>{t('login.loginBtn')}</a>
              </>
            ) : (
              <>
                {t('login.noAccount')} <a href="#signup" onClick={() => setIsSignup(true)}>{t('login.signup')}</a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
