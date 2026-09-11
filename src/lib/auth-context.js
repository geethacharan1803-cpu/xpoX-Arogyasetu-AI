'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_USERS } from '@/lib/demo-data';

const AuthContext = createContext(null);

export function getDashboardForRole(role) {
  switch (role) {
    case 'asha':
    case 'anm':
    case 'cho':
      return '/asha/dashboard';
    case 'doctor':
    case 'medical_officer':
    case 'bmo':
      return '/doctor/dashboard';
    case 'admin':
    case 'cmho':
      return '/admin/dashboard';
    case 'patient':
      return '/patient/home';
    default:
      return '/patient/home';
  }
}

export function isRouteAllowedForRole(role, pathname) {
  if (!role || !pathname) return false;
  if (pathname.startsWith('/asha')) {
    return ['asha', 'anm', 'cho', 'admin'].includes(role);
  }
  if (pathname.startsWith('/doctor')) {
    return ['doctor', 'medical_officer', 'bmo', 'cmho', 'admin'].includes(role);
  }
  if (pathname.startsWith('/patient')) {
    // Only patient and admin can see patient dashboard
    return ['patient', 'admin'].includes(role);
  }
  if (pathname.startsWith('/admin')) {
    return ['admin', 'bmo', 'cmho'].includes(role);
  }
  return true;
}

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

  const login = async (role, credentials = null) => {
    try {
      // Try API login first to get real database user
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials ? credentials : { role }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('arogyasetu_user', JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (e) {
      console.warn('API login failed, falling back to local demo profile:', e);
    }

    // Fallback if API was unavailable
    let userData = DEMO_USERS[role];
    if (!userData) {
      if (role === 'anm') {
        userData = { id: 'U-005', name: 'Sunita ANM', role: 'anm', phc: 'PHC Rampur', area: 'Rampur Sub-Centre' };
      } else if (role === 'cho') {
        userData = { id: 'U-006', name: 'Ramesh CHO', role: 'cho', phc: 'PHC Rampur', area: 'Health & Wellness Centre' };
      } else if (role === 'bmo') {
        userData = { id: 'U-007', name: 'Dr. Verma (BMO)', role: 'bmo', phc: 'Block Health Office', area: 'Rampur Block' };
      } else if (role === 'cmho') {
        userData = { id: 'U-008', name: 'Dr. Rao (CMHO)', role: 'cmho', phc: 'District Medical Office', area: 'District Medical Jurisdiction' };
      } else {
        userData = DEMO_USERS.asha;
      }
    }

    if (userData) {
      setUser(userData);
      try {
        localStorage.setItem('arogyasetu_user', JSON.stringify(userData));
      } catch (e) {
        // localStorage unavailable
      }
      return userData;
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

  const canAccess = useCallback((pathname) => {
    if (!user) return false;
    return isRouteAllowedForRole(user.role, pathname);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, canAccess, getDashboardForRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: async () => {},
      logout: () => {},
      loading: false,
      canAccess: () => false,
      getDashboardForRole: () => '/patient/home',
    };
  }
  return context;
}
