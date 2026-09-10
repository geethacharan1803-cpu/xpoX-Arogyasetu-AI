'use client';

import { DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG = {
  'due-today': { label: 'Due Today', badge: 'badge-warning', icon: Clock },
  'upcoming': { label: 'Upcoming', badge: 'badge-info', icon: CalendarCheck },
  'overdue': { label: 'Overdue', badge: 'badge-danger', icon: AlertTriangle },
  'completed': { label: 'Completed', badge: 'badge-success', icon: CheckCircle },
};

export default function AshaFollowups() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const dueToday = DEMO_FOLLOWUPS.filter(f => f.status === 'due-today');
  const overdue = DEMO_FOLLOWUPS.filter(f => f.status === 'overdue');
  const upcoming = DEMO_FOLLOWUPS.filter(f => f.status === 'upcoming');

  const filtered = filter === 'all'
    ? DEMO_FOLLOWUPS
    : DEMO_FOLLOWUPS.filter(f => f.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Follow-ups</h1>
        <p className="page-subtitle">Track patient follow-up visits</p>
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
          { key: 'due-today', label: 'Due Today' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'upcoming', label: 'Upcoming' },
        ].map(f => (
          <button key={f.key} className={`tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">No follow-ups due</p>
            <p className="empty-state-text">No follow-ups match the selected filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(fu => {
            const config = STATUS_CONFIG[fu.status] || STATUS_CONFIG['upcoming'];
            return (
              <div key={fu.id} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => router.push(`/asha/patients/${fu.patientId}`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                      <span className="font-semibold">{fu.patientName}</span>
                      <span className={`badge ${config.badge}`}>{config.label}</span>
                    </div>
                    <div className="text-sm text-secondary">{fu.reason}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      {fu.type} | Due: {fu.dueDate}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-primary">Mark Complete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
