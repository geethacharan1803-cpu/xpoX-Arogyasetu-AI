'use client';

import { useRouter } from 'next/navigation';
import { CalendarCheck, Clock, AlertTriangle, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const STATUS_CONFIG = {
  'due-today': { label: 'Due Today', badge: 'badge-warning', icon: Clock },
  'upcoming': { label: 'Upcoming', badge: 'badge-info', icon: CalendarCheck },
  'overdue': { label: 'Overdue', badge: 'badge-danger', icon: AlertTriangle },
  'completed': { label: 'Completed', badge: 'badge-success', icon: CheckCircle },
};

export default function AshaFollowups() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/followups');
      if (res.ok) {
        const d = await res.json();
        setFollowups(d.followups || []);
      }
    } catch (e) {
      console.error('Error loading follow-ups:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowups();
  }, [loadFollowups]);

  const handleMarkComplete = async (e, fuId) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/followups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fuId, status: 'completed' }),
      });
      if (res.ok) {
        setFollowups(prev => prev.map(f => f.id === fuId ? { ...f, status: 'completed' } : f));
      }
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const dueToday = followups.filter(f => f.status === 'due-today');
  const overdue = followups.filter(f => f.status === 'overdue');
  const upcoming = followups.filter(f => f.status === 'upcoming');

  const filtered = filter === 'all'
    ? followups
    : followups.filter(f => f.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Follow-ups</h1>
        <p className="page-subtitle">Track patient follow-up visits &bull; Real Database</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon warning"><Clock size={18} /></div>
          <div className="stat-card-value">{dueToday.length}</div>
          <div className="stat-card-label">Due Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon danger"><AlertTriangle size={18} /></div>
          <div className="stat-card-value">{overdue.length}</div>
          <div className="stat-card-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon info"><CalendarCheck size={18} /></div>
          <div className="stat-card-value">{upcoming.length}</div>
          <div className="stat-card-label">Upcoming</div>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'due-today', label: `Due Today (${dueToday.length})` },
          { key: 'overdue', label: `Overdue (${overdue.length})` },
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'completed', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading follow-ups from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CalendarCheck size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-sm)' }} />
            <p className="empty-state-title">No follow-ups found</p>
            <p className="empty-state-text">No follow-ups matching this filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(fu => {
            const config = STATUS_CONFIG[fu.status] || STATUS_CONFIG['upcoming'];
            const Icon = config.icon;
            return (
              <div key={fu.id} className="card" style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                      <span className="font-semibold text-sm">{fu.id}</span>
                      <span className={`badge ${config.badge}`}>
                        <Icon size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {config.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginTop: 'var(--space-xs)', marginBottom: 2 }}>
                      {fu.reason}
                    </h3>
                    <p className="text-xs text-muted">
                      Patient: <strong>{fu.patientName}</strong> ({fu.patientId}) &bull; Due Date: <strong>{fu.dueDate}</strong> &bull; Assigned: {fu.assignedTo}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    {fu.status !== 'completed' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => handleMarkComplete(e, fu.id)}
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => router.push(`/asha/patients/${fu.patientId}`)}
                    >
                      View Patient <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
