import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { authApi } from './lib/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiAuthEnabled = Boolean(import.meta.env.VITE_AUTH_API_URL);

  const normalizeSessionResponse = (response) => {
    if (!response) return null;
    if (response?.session?.user) return response.session.user;
    if (response?.user) return response.user;
    return null;
  };

  // Initialize auth session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiAuthEnabled) {
          const sessionResponse = await authApi.getSession();
          const sessionUser = normalizeSessionResponse(sessionResponse);
          if (sessionUser) {
            setUser(sessionUser);
          }
        } else {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session:', error);
          } else if (session?.user) {
            setUser(session.user);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    let unsubscribe = () => {};

    if (!apiAuthEnabled) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        }
      );

      unsubscribe = () => subscription?.unsubscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [apiAuthEnabled]);

  const signUp = async (email, password, metadata = {}) => {
    try {
      const response = apiAuthEnabled
        ? await authApi.signUp(email, password, metadata)
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          });

      const data = apiAuthEnabled ? response : response.data;
      const error = apiAuthEnabled ? null : response.error;

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
      }

      return { user: data?.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = apiAuthEnabled
        ? await authApi.signIn(email, password)
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

      const data = apiAuthEnabled ? response : response.data;
      const error = apiAuthEnabled ? null : response.error;

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
      }

      return { user: data?.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (apiAuthEnabled) {
        await authApi.signOut();
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      }

      setUser(null);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const response = apiAuthEnabled
        ? await authApi.updateUser(updates)
        : await supabase.auth.updateUser({
            data: updates,
          });

      const data = apiAuthEnabled ? response : response.data;
      const error = apiAuthEnabled ? null : response.error;

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
      }

      return { user: data?.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signUp, 
        signIn, 
        logout, 
        updateProfile, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
