import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust mock auth implementation for development when API keys are not configured
const mockAuth = {
  getSession: async () => {
    const user = localStorage.getItem('supabase_user');
    return {
      data: { session: user ? { user: JSON.parse(user) } : null },
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
      id: Math.random().toString(36).substr(2, 9),
      email: finalEmail,
      user_metadata: finalMetadata,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('supabase_user', JSON.stringify(user));
    return { data: { user }, error: null };
  },

  signInWithPassword: async (email, password) => {
    let finalEmail = '';
    if (typeof email === 'object' && email !== null) {
      finalEmail = email.email || '';
    } else {
      finalEmail = typeof email === 'string' ? email : '';
    }

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email: finalEmail,
      user_metadata: {},
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('supabase_user', JSON.stringify(user));
    return { data: { user }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem('supabase_user');
    return { error: null };
  },

  updateUser: async (updates) => {
    const user = JSON.parse(localStorage.getItem('supabase_user') || '{}');
    const updatedUser = {
      ...user,
      user_metadata: { ...user.user_metadata, ...updates.data },
    };
    localStorage.setItem('supabase_user', JSON.stringify(updatedUser));
    return { data: { user: updatedUser }, error: null };
  },

  onAuthStateChange: (callback) => {
    const user = localStorage.getItem('supabase_user');
    callback('INITIAL_SESSION', user ? { session: { user: JSON.parse(user) } } : { session: null });

    return {
      data: {
        subscription: {
          unsubscribe: () => {},
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


