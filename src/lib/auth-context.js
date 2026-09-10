'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '@/lib/demo-data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session
    try {
      const saved = localStorage.getItem('arogyasetu_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore parse errors
    }
    setLoading(false);
  }, []);

  const login = (role) => {
    const userData = DEMO_USERS[role];
    if (userData) {
      setUser(userData);
      try {
        localStorage.setItem('arogyasetu_user', JSON.stringify(userData));
      } catch (e) {
        // localStorage unavailable
      }
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('arogyasetu_user');
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: () => {},
      logout: () => {},
      loading: false,
    };
  }
  return context;
}

