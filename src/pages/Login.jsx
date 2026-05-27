import React, { useState, useEffect } from 'react';
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
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Handle Google Login
  const handleGoogleLogin = (response) => {
    if (response.credential) {
      try {
        // Decode the JWT token to get user info
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const userData = JSON.parse(jsonPayload);

        // Login/Sign up with Google data
        login(userData.email, 'google-oauth', {
          name: userData.name,
          picture: userData.picture,
          bio: '🎵 Music Creator',
          followers: 0,
          following: 0,
          collaborations: 0,
          recentWorks: [],
        });

        navigate('/profile');
      } catch (err) {
        setError('Google login failed. Please try again.');
      }
    }
  };

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize Google Sign-In button
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with your Google Client ID
        callback: handleGoogleLogin,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-button'),
        { theme: 'outline', size: 'large', text: 'signup_with' }
      );
    }
  }, [handleGoogleLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignup && !name) {
      setError('Please enter your name');
      return;
    }

    // Simulate authentication
    try {
      login(email, password, {
        name: name || email.split('@')[0],
        bio: '🎵 Music Creator',
        followers: 0,
        following: 0,
        collaborations: 0,
        recentWorks: [],
      });
      
      navigate('/profile');
    } catch (err) {
      setError('Login failed. Please try again.');
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
            
            <button type="submit" className="login-button">
              {isSignup ? 'Sign Up' : t('login.loginBtn')}
            </button>
          </form>

          <div className="divider">
            <span>{t('login.orContinueWith')}</span>
          </div>

          <div className="oauth-buttons">
            <div id="google-button"></div>
          </div>
          
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
