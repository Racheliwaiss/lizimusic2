import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust mock auth implementation for development when API keys are not configured
const _listeners = [];

const _notify = (event, session) => {
  _listeners.forEach((cb) => cb(event, session));
};

const mockAuth = {
  getSession: async () => {
    const raw = localStorage.getItem('supabase_user');
    return {
      data: { session: raw ? { user: JSON.parse(raw) } : null },
      error: null,
    };
  },

  signUp: async (email, password, options) => {
    let finalEmail = '';
    let finalMetadata = {};

    if (typeof email === 'object' && email !== null) {
      finalEmail = email.email || '';
      finalMetadata = email.options?.data || {};
    } else {
      finalEmail = typeof email === 'string' ? email : '';
      finalMetadata = options?.data || {};
    }

    const user = {
      id: 'mock_' + finalEmail.replace(/[^a-z0-9]/gi, '_'),
      email: finalEmail,
      user_metadata: finalMetadata,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('supabase_user', JSON.stringify(user));
    _notify('SIGNED_IN', { user });
    return { data: { user }, error: null };
  },

  signInWithPassword: async (email, password) => {
    const finalEmail = (typeof email === 'object' && email !== null)
      ? (email.email || '')
      : (typeof email === 'string' ? email : '');

    /* Reuse the existing stored user if the email matches —
       this preserves all previously saved user_metadata on re-login. */
    const raw = localStorage.getItem('supabase_user');
    if (raw) {
      try {
        const existing = JSON.parse(raw);
        if (existing.email === finalEmail) {
          _notify('SIGNED_IN', { user: existing });
          return { data: { user: existing }, error: null };
        }
      } catch {}
    }

    /* New user — use a deterministic ID so the same email always
       gets the same user ID across sign-ups in mock mode. */
    const user = {
      id: 'mock_' + finalEmail.replace(/[^a-z0-9]/gi, '_'),
      email: finalEmail,
      user_metadata: {},
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('supabase_user', JSON.stringify(user));
    _notify('SIGNED_IN', { user });
    return { data: { user }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem('supabase_user');
    _notify('SIGNED_OUT', null);
    return { error: null };
  },

  updateUser: async (updates) => {
    const user = JSON.parse(localStorage.getItem('supabase_user') || '{}');
    const updatedUser = {
      ...user,
      user_metadata: { ...user.user_metadata, ...updates.data },
    };
    localStorage.setItem('supabase_user', JSON.stringify(updatedUser));
    _notify('USER_UPDATED', { user: updatedUser });
    return { data: { user: updatedUser }, error: null };
  },

  onAuthStateChange: (callback) => {
    _listeners.push(callback);
    // Fire immediately with current session (matches real Supabase behaviour)
    const raw = localStorage.getItem('supabase_user');
    const session = raw ? { user: JSON.parse(raw) } : null;
    Promise.resolve().then(() => callback('INITIAL_SESSION', session));

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = _listeners.indexOf(callback);
            if (idx !== -1) _listeners.splice(idx, 1);
          },
        },
      },
    };
  },
};

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

// Export the real Supabase client if configured, otherwise fallback to mock
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { auth: mockAuth };


