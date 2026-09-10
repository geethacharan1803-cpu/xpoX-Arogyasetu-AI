'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/auth-context';
import { Menu, WifiOff } from 'lucide-react';

export default function AppShell({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          You are offline. Your information will sync when the connection is restored.
        </div>
      )}

      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
        <div className="demo-badge">DEMO MODE</div>
      )}

      <div className="app-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

        <div className="mobile-header">
          <button className="btn btn-icon" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span className="mobile-header-brand">ArogyaSetu AI</span>
          <div style={{ width: 40 }} />
        </div>

        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}
