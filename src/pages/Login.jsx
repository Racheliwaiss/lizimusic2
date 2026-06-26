import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import './Pages.css';

function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signIn, signUp } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (oauthError) {
      setError(oauthError.message || 'Google login failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const normalizeError = (v) => {
    if (!v) return 'An unknown error occurred.';
    if (typeof v === 'string') return v;
    if (v?.message) return v.message;
    return JSON.stringify(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your name'); return; }
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password, {
        name: name || email.split('@')[0],
        bio: '🎵 Music Creator',
      });
      if (error) { setError(normalizeError(error)); setLoading(false); return; }
    } else {
      const { error } = await signIn(email, password);
      if (error) { setError(normalizeError(error)); setLoading(false); return; }
    }
    setLoading(false);
    navigate('/dashboard');
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);

    // Flag this tab so AuthCallback knows the incoming code is a recovery, not a login.
    // Supabase PKCE reset links arrive as ?code=XXX with no type=recovery in the URL.
    try { sessionStorage.setItem('lizi_recovery_pending', '1'); } catch {}

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback',
    });
    setLoading(false);
    if (resetError) {
      try { sessionStorage.removeItem('lizi_recovery_pending'); } catch {}
      setError(resetError.message || 'Could not send reset email. Try again.');
    } else {
      setForgotSent(true);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setForgotSent(false);
  };

  return (
    <div className="page login-page">
      <button className="login-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="login-container">
        <div className="login-box">
          <h1>🎵 LIZI</h1>

          {/* ── Forgot Password ─────────────────────────────────────────── */}
          {mode === 'forgot' && (
            <>
              <h2>Reset Password</h2>
              {error && <div className="error-message">{error}</div>}
              {forgotSent ? (
                <div className="login-success-message">
                  Check your email — we sent a password reset link!
                </div>
              ) : (
                <form onSubmit={handleForgot}>
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
                  <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Reset Email'}
                  </button>
                </form>
              )}
              <p className="signup-link">
                <a href="#login" onClick={(e) => { e.preventDefault(); switchMode('login'); }}>
                  Back to login
                </a>
              </p>
            </>
          )}

          {/* ── Login / Sign Up ──────────────────────────────────────────── */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <h2>{mode === 'signup' ? 'Sign Up' : t('login.title')}</h2>
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      required
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
                  {mode === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '0.35rem' }}>
                      <a
                        href="#forgot"
                        className="login-forgot-link"
                        onClick={(e) => { e.preventDefault(); switchMode('forgot'); }}
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? 'Loading…' : (mode === 'signup' ? 'Sign Up' : t('login.loginBtn'))}
                </button>
              </form>

              <div className="divider">
                <span>{t('login.orContinueWith')}</span>
              </div>

              <div className="oauth-buttons">
                <button
                  type="button"
                  className="google-login-btn"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>
              </div>

              <p className="signup-link">
                {mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <a href="#login" onClick={(e) => { e.preventDefault(); switchMode('login'); }}>
                      {t('login.loginBtn')}
                    </a>
                  </>
                ) : (
                  <>
                    {t('login.noAccount')}{' '}
                    <a href="#signup" onClick={(e) => { e.preventDefault(); switchMode('signup'); }}>
                      {t('login.signup')}
                    </a>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
