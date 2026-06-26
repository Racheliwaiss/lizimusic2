import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import './Pages.css';

/*
  Handles every flow that lands at /auth/callback:

  RECOVERY (password reset):
  ─ PKCE:     ?code=XXXX            (Supabase v2 default — no type in URL)
  ─ Implicit: #access_token=…&type=recovery
  ─ Flag:     sessionStorage.lizi_recovery_pending (set by Login.jsx before redirect)
  → Exchange code if present, then show "Set New Password" form.

  REGULAR LOGIN:
  ─ PKCE:     ?code=XXXX            → exchange, loginWithSession, navigate /dashboard
  ─ Implicit: #access_token=…       → AuthContext already set user, navigate /dashboard
*/

const centerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithSession } = useAuth();

  // Detect recovery from ALL possible signals (checked synchronously)
  const [isRecovery] = useState(() => {
    const hp = new URLSearchParams(window.location.hash.slice(1));
    const qp = new URLSearchParams(window.location.search);
    return (
      hp.get('type') === 'recovery' ||   // implicit flow
      qp.get('type') === 'recovery' ||   // some Supabase configs add this as query param
      !!sessionStorage.getItem('lizi_recovery_pending') // set by Login.jsx before redirect
    );
  });

  const [error, setError]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating]             = useState(false);
  const [done, setDone]                     = useState(false);
  // For PKCE recovery: true once the code has been exchanged and the form is safe to show
  const [ready, setReady]                   = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    if (!isRecovery) {
      // ── Regular login ────────────────────────────────────────────────────────
      let cancelled = false;
      async function handleLogin() {
        if (code) {
          try {
            const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
            if (err) throw err;
            if (data?.session) {
              loginWithSession(data.session);
              try { sessionStorage.setItem('lizi_welcome_pending', '1'); } catch {}
            }
          } catch (err) {
            console.error('[LIZI] PKCE exchange failed:', err);
            if (!cancelled) setError(err.message);
            return;
          }
        }
        // Implicit flow: AuthContext already set the user via parseHashSession
        if (!cancelled) navigate('/dashboard', { replace: true });
      }
      handleLogin();
      return () => { cancelled = true; };
    }

    // ── Recovery flow ─────────────────────────────────────────────────────────
    sessionStorage.removeItem('lizi_recovery_pending');

    if (code) {
      // PKCE recovery: exchange the code so supabase-js holds the session.
      // supabase.auth.updateUser() reads the session from supabase-js storage,
      // so the exchange MUST happen before the form is shown.
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error: err }) => {
          if (err) { setError(err.message); }
          else if (data?.session) { loginWithSession(data.session); }
          setReady(true);
        });
    } else {
      // Implicit recovery: #access_token already consumed by parseHashSession
      // in AuthContext. Copy it into supabase-js storage so updateUser works.
      try {
        const raw = localStorage.getItem('lizi_auth_session');
        if (raw) {
          const { session } = JSON.parse(raw);
          if (session?.access_token) {
            supabase.auth.setSession({
              access_token:  session.access_token,
              refresh_token: session.refresh_token || '',
            });
          }
        }
      } catch {}
      setReady(true);
    }
  }, [navigate, loginWithSession, isRecovery]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setUpdating(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Could not update password. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // ── Recovery UI ────────────────────────────────────────────────────────────

  if (isRecovery) {
    if (done) {
      return (
        <div className="page" style={centerStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Password updated!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Redirecting you to your dashboard…</p>
          </div>
        </div>
      );
    }

    if (!ready && !error) {
      return (
        <div className="page" style={centerStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'inline-block', animation: 'spin 1.2s linear infinite' }}>🔐</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Verifying reset link…</p>
          </div>
        </div>
      );
    }

    return (
      <div className="page login-page" style={centerStyle}>
        <div className="login-box" style={{ width: '100%', maxWidth: 440 }}>
          <h1>🎵 LIZI</h1>
          <h2>Set New Password</h2>
          {error && <div className="error-message">{error}</div>}
          {!error && (
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label htmlFor="pw">New Password</label>
                <input
                  type="password"
                  id="pw"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="pw2">Confirm Password</label>
                <input
                  type="password"
                  id="pw2"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="login-button" disabled={updating}>
                {updating ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
          {error && (
            <p className="signup-link" style={{ marginTop: '1rem' }}>
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Back to login
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Error state (regular login) ────────────────────────────────────────────

  if (error) {
    return (
      <div className="page" style={centerStyle}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Login failed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
          <button className="cta-button" onClick={() => navigate('/login')}>Try Again</button>
        </div>
      </div>
    );
  }

  // ── Loading spinner (regular login, awaiting PKCE exchange) ───────────────

  return (
    <div className="page" style={centerStyle}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'inline-block', animation: 'spin 1.2s linear infinite' }}>🎵</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Completing login…</p>
      </div>
    </div>
  );
}

export default AuthCallback;
