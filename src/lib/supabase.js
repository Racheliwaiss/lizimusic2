// Mock Supabase Client - Replace with real package when npm install works
// import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock auth implementation for development
const mockAuth = {
  getSession: async () => {
    const user = localStorage.getItem('supabase_user');
    return {
      data: { session: user ? { user: JSON.parse(user) } : null },
      error: null,
    };
  },

  signUp: async (email, password, options) => {
    const normalizedEmail = typeof email === 'string' ? email : email?.email || '';
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email: normalizedEmail,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('supabase_user', JSON.stringify(user));
    return { data: { user }, error: null };
  },

  signInWithPassword: async (email, password) => {
    const normalizedEmail = typeof email === 'string' ? email : email?.email || '';
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email: normalizedEmail,
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

// Mock Supabase client
export const supabase = {
  auth: mockAuth,
};

