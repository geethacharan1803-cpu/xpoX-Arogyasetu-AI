'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_USERS } from '@/lib/demo-data';

const AuthContext = createContext(null);

/**
 * Maps every role to its authorized dashboard path.
 * Each role has exactly ONE target dashboard — no role shares another role's landing page.
 */
export function getDashboardForRole(role) {
  switch (role) {
    case 'asha':
      return '/asha/dashboard';
    case 'anm':
      return '/asha/dashboard';
    case 'cho':
      return '/asha/dashboard';
    case 'doctor':
    case 'medical_officer':
      return '/doctor/dashboard';
    case 'bmo':
      return '/doctor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'cmho':
      return '/admin/dashboard';
    case 'patient':
      return '/patient/home';
    default:
      return '/login';
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

/**
 * Encodes user session info for API authorization header.
 * Lightweight base64 token (userId:role) — suitable for demo/dev.
 */
function encodeSessionToken(user) {
  if (!user || !user.id || !user.role) return null;
  try {
    return btoa(JSON.stringify({ id: user.id, role: user.role, name: user.name }));
  } catch {
    return null;
  }
}

/**
 * Patches global fetch to automatically include X-User-Session header
 * on requests to /api/ endpoints.
 */
let fetchPatched = false;
function patchFetchWithSession(getToken) {
  if (fetchPatched || typeof window === 'undefined') return;
  const originalFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    const urlStr = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');
    if (urlStr.startsWith('/api/') || urlStr.includes('/api/')) {
      const token = getToken();
      if (token) {
        options = { ...options };
        options.headers = {
          ...(options.headers || {}),
          'X-User-Session': token,
        };
      }
    }
    return originalFetch.call(this, url, options);
  };
  fetchPatched = true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    // Check localStorage for saved session
    try {
      const saved = localStorage.getItem('arogyasetu_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setSessionToken(encodeSessionToken(parsed));
      }
    } catch (e) {
      // Ignore parse errors
    }
    setLoading(false);
  }, []);

  // Patch fetch to include session token on all API requests
  useEffect(() => {
    patchFetchWithSession(() => sessionToken);
  }, [sessionToken]);

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
          const token = data.sessionToken || encodeSessionToken(data.user);
          setUser(data.user);
          setSessionToken(token);
          localStorage.setItem('arogyasetu_user', JSON.stringify(data.user));
          if (token) localStorage.setItem('arogyasetu_session', token);
          return data.user;
        }
      }
    } catch (e) {
      console.warn('API login failed, falling back to local demo profile:', e);
    }

    // Fallback if API was unavailable — STRICT role matching only
    const roleDemoMap = {
      asha: DEMO_USERS.asha,
      doctor: DEMO_USERS.doctor,
      patient: DEMO_USERS.patient,
      admin: DEMO_USERS.admin,
      anm: { id: 'U-005', name: 'Sunita ANM', role: 'anm', phc: 'PHC Rampur', area: 'Rampur Sub-Centre' },
      cho: { id: 'U-006', name: 'Ramesh CHO', role: 'cho', phc: 'PHC Rampur', area: 'Health & Wellness Centre' },
      bmo: { id: 'U-007', name: 'Dr. Verma (BMO)', role: 'bmo', phc: 'Block Health Office', area: 'Rampur Block' },
      cmho: { id: 'U-008', name: 'Dr. Rao (CMHO)', role: 'cmho', phc: 'District Medical Office', area: 'District Medical Jurisdiction' },
      medical_officer: DEMO_USERS.doctor,
    };

    const userData = roleDemoMap[role];
    if (!userData) {
      // Unknown role — do NOT fall back to another role's data
      console.error(`Unknown role "${role}" — no demo user available`);
      return null;
    }

    const token = encodeSessionToken(userData);
    setUser(userData);
    setSessionToken(token);
    try {
      localStorage.setItem('arogyasetu_user', JSON.stringify(userData));
      if (token) localStorage.setItem('arogyasetu_session', token);
    } catch (e) {
      // localStorage unavailable
    }
    return userData;
  };

  const logout = () => {
    setUser(null);
    setSessionToken(null);
    try {
      localStorage.removeItem('arogyasetu_user');
      localStorage.removeItem('arogyasetu_session');
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
      getDashboardForRole: () => '/login',
    };
  }
  return context;
}
