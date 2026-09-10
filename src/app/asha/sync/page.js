'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, WifiOff, AlertTriangle, Cloud } from 'lucide-react';

export default function AshaSyncPage() {
  const [syncStatus, setSyncStatus] = useState('synced');
  const [lastSync, setLastSync] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setLastSync(new Date().toLocaleString());
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setLastSync(new Date().toLocaleString());
    }, 2000);
  };

  const statusConfig = {
    synced: { icon: CheckCircle, label: 'Synced', desc: 'All data is up to date', color: 'var(--color-success)', badge: 'badge-success' },
    syncing: { icon: RefreshCw, label: 'Syncing...', desc: 'Uploading local changes', color: 'var(--color-primary)', badge: 'badge-primary' },
    offline: { icon: WifiOff, label: 'Offline', desc: 'Your information will sync when the connection is restored', color: 'var(--color-warning)', badge: 'badge-warning' },
    failed: { icon: AlertTriangle, label: 'Sync Failed', desc: 'Please try again', color: 'var(--color-danger)', badge: 'badge-danger' },
  };

  const current = statusConfig[syncStatus];
  const StatusIcon = current.icon;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sync Status</h1>
        <p className="page-subtitle">Manage offline data synchronization</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: current.badge === 'badge-success' ? 'var(--color-success-light)' : current.badge === 'badge-primary' ? 'var(--color-primary-100)' : 'var(--color-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)' }}>
          <StatusIcon size={28} style={{ color: current.color, animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none' }} />
        </div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>{current.label}</h2>
        <p className="text-sm text-secondary">{current.desc}</p>
        {lastSync && <p className="text-xs text-muted" style={{ marginTop: 'var(--space-sm)' }}>Last synced: {lastSync}</p>}
        <button
          className="btn btn-primary btn-lg"
          style={{ marginTop: 'var(--space-lg)' }}
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
        >
          <RefreshCw size={18} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Sync Information</h3>
        <div className="info-grid">
          <span className="info-label">Connection</span>
          <span className="info-value">
            <span className={`badge ${isOnline ? 'badge-success' : 'badge-danger'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </span>
          <span className="info-label">Local Records</span>
          <span className="info-value">8 patients, 6 tickets, 5 referrals</span>
          <span className="info-label">Pending Upload</span>
          <span className="info-value">0 records</span>
          <span className="info-label">Storage Used</span>
          <span className="info-value">2.4 KB</span>
        </div>
      </div>
    </div>
  );
}
