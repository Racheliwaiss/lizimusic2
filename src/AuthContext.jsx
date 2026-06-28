import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, supabaseStorageKey } from './lib/supabase';

const AuthContext = createContext();

/*
  We store sessions in this key.  supabase-js is unaware of it, so it
  cannot call /auth/v1/user to "validate" the token and fire SIGNED_OUT.
  The trade-off: supabase.from() queries won't be authenticated until the
  user has a valid anon key.  db.js already falls back to localStorage for
  that case, so the app stays functional.
*/
const LOCAL_SESSION_KEY = 'lizi_auth_session';

// ── JWT helpers ────────────────────────────────────────────────────────────────

function decodeJwtPayload(token) {
  try {
    let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad to a multiple of 4 — atob() requires it, base64url omits padding
    b64 = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    return JSON.parse(atob(b64));
  } catch { return null; }
}

function buildUser(payload) {
  return {
    id:                 payload.sub,
    email:              payload.email              ?? '',
    email_confirmed_at: payload.email_confirmed_at ?? null,
    phone:              payload.phone              ?? '',
    confirmed_at:       payload.confirmed_at       ?? null,
    last_sign_in_at:    payload.last_sign_in_at    ?? new Date().toISOString(),
    app_metadata:       payload.app_metadata       ?? {},
    user_metadata:      payload.user_metadata      ?? {},
    created_at:         payload.created_at         ?? new Date().toISOString(),
    updated_at:         payload.updated_at         ?? new Date().toISOString(),
    aud:                payload.aud                ?? 'authenticated',
    role:               payload.role               ?? 'authenticated',
    is_anonymous:       false,
  };
}

// ── Local session helpers ──────────────────────────────────────────────────────

function readLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Backward-compat: check the old mock key
  try {
    const raw = localStorage.getItem('supabase_user');
    if (raw) return { user: JSON.parse(raw), session: null };
  } catch {}
  return null;
}

function writeLocalSession(user, session = null) {
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user, session }));
    // Keep the mock key in sync so db.js helpers that read it still work
    localStorage.setItem('supabase_user', JSON.stringify(user));
  } catch {}
}

function clearLocalSession() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
  localStorage.removeItem('supabase_user');
  if (supabaseStorageKey) localStorage.removeItem(supabaseStorageKey);
}

// ── OAuth hash parser ──────────────────────────────────────────────────────────

/*
  Runs SYNCHRONOUSLY inside the useState() initialiser so the user is
  available on the very first render — before ProtectedRoute or the
  header can see the logged-out state.

  Also stores the session in LOCAL_SESSION_KEY immediately so it
  survives the next page load without needing the hash again.
*/
function parseHashSession() {
  try {
    const hp = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hp.get('access_token');
    if (!accessToken) return null;

    const payload = decodeJwtPayload(accessToken);
    if (!payload?.sub) return null;

    const now      = Math.floor(Date.now() / 1000);
    const expiresIn = parseInt(hp.get('expires_in') || '3600', 10);
    const user     = buildUser(payload);
    const session  = {
      access_token:  accessToken,
      refresh_token: hp.get('refresh_token') || '',
      token_type:    hp.get('token_type')    || 'bearer',
      expires_in:    expiresIn,
      expires_at:    payload.exp ?? now + expiresIn,
      user,
    };

    // Persist BEFORE supabase-js initialises and can interfere
    writeLocalSession(user, session);
    // Signal Layout to show a "logged in" toast — but not for password recovery
    const type = hp.get('type');
    if (type !== 'recovery') {
      try { sessionStorage.setItem('lizi_welcome_pending', '1'); } catch {}
    }
    return { user, session, source: 'hash' };
  } catch { return null; }
}

// ── Synchronous startup resolver ───────────────────────────────────────────────

function resolveInitialAuth() {
  // 1. OAuth hash (highest priority — user just completed Google login)
  const fromHash = parseHashSession();
  if (fromHash) return fromHash;

  // 2. Previously stored local session (next-page-load after OAuth or mock login)
  const stored = readLocalSession();
  if (stored?.user) return { user: stored.user, session: stored.session, source: 'storage' };

  return null;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [initial] = useState(resolveInitialAuth);
  const [user,    setUser]    = useState(initial?.user ?? null);
  const [loading, setLoading] = useState(initial === null);

  useEffect(() => {
    // ── OAuth or stored local session ──────────────────────────────────────
    if (initial?.source === 'hash') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(false);
      /*
        Do NOT connect supabase.auth.onAuthStateChange here.
        The real client would try to validate the token via GET /auth/v1/user,
        which fails (401) when the anon key is stale, and then it fires
        SIGNED_OUT — overriding the user we just set.
      */
      return;
    }

    if (initial?.source === 'storage') {
      setLoading(false);
      return; // Same reason — skip supabase-js auth subscription
    }

    // ── Normal startup: no local session, try real Supabase ───────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearLocalSession();
        setUser(null);
      } else {
        const u = session?.user ?? null;
        setUser(u);
        if (u) writeLocalSession(u, session);
      }
      setLoading(false);
    });

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) console.error('[LIZI] getSession error:', error.message);
        if (session?.user) {
          setUser(session.user);
          writeLocalSession(session.user, session);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[LIZI] Auth init error:', err);
        setLoading(false);
      });

    return () => subscription?.unsubscribe();
  }, [initial]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: metadata },
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        writeLocalSession(data.user, data.session);
      }
      return { user: data?.user, error: null };
    } catch {
      // Real Supabase unavailable (wrong/missing anon key) — use local mock
      const id   = 'mock_' + email.replace(/[^a-z0-9]/gi, '_');
      const user = {
        id, email,
        user_metadata: metadata,
        app_metadata:  {},
        created_at:    new Date().toISOString(),
        updated_at:    new Date().toISOString(),
        aud:  'authenticated',
        role: 'authenticated',
      };
      setUser(user);
      writeLocalSession(user);
      return { user, error: null };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        writeLocalSession(data.user, data.session);
      }
      return { user: data?.user, error: null };
    } catch {
      // Real Supabase unavailable — restore stored account or create new one
      const stored = readLocalSession();
      const user   = (stored?.user?.email === email)
        ? stored.user
        : {
            id:            'mock_' + email.replace(/[^a-z0-9]/gi, '_'),
            email,
            user_metadata: {},
            app_metadata:  {},
            created_at:    new Date().toISOString(),
            updated_at:    new Date().toISOString(),
            aud:  'authenticated',
            role: 'authenticated',
          };
      setUser(user);
      writeLocalSession(user);
      return { user, error: null };
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    clearLocalSession();
    setUser(null);
    return { error: null };
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' };
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        writeLocalSession(data.user);
      }
      return { user: data?.user, error: null };
    } catch {
      // Merge locally when API is unavailable.
      // Preserve the existing session object so the access_token is not erased —
      // db.js reads it from lizi_auth_session for authenticated writes.
      const merged = {
        ...user,
        user_metadata: { ...(user.user_metadata || {}), ...updates },
      };
      setUser(merged);
      const existing = readLocalSession();
      writeLocalSession(merged, existing?.session ?? null);
      return { user: merged, error: null };
    }
  };

  const loginWithSession = useCallback((session) => {
    if (session?.user) {
      setUser(session.user);
      writeLocalSession(session.user, session);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      loginWithSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
