'use client';

import { useRouter } from 'next/navigation';
import { DEMO_HEALTH_TICKETS } from '@/lib/demo-data';
import { FileText, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const STATUS_MAP = {
  'registered': { label: 'Registered', badge: 'badge-neutral' },
  'symptoms-recorded': { label: 'Symptoms Recorded', badge: 'badge-neutral' },
  'vitals-added': { label: 'Vitals Added', badge: 'badge-info' },
  'referred': { label: 'Referred', badge: 'badge-warning' },
  'doctor-reviewed': { label: 'Doctor Reviewed', badge: 'badge-primary' },
  'prescription-added': { label: 'Prescription Added', badge: 'badge-success' },
  'follow-up-scheduled': { label: 'Follow-up Scheduled', badge: 'badge-success' },
};

export default function AshaTickets() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? DEMO_HEALTH_TICKETS
    : DEMO_HEALTH_TICKETS.filter(t => t.priority === filter);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Health Tickets</h1>
          <p className="page-subtitle">{DEMO_HEALTH_TICKETS.length} total tickets</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'high', label: 'High Priority' },
          { key: 'medium', label: 'Medium' },
        ].map(f => (
          <button key={f.key} className={`tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <p className="empty-state-title">No health tickets found</p>
            <p className="empty-state-text">No tickets match the selected filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(ticket => {
            const status = STATUS_MAP[ticket.status] || { label: ticket.status, badge: 'badge-neutral' };
            return (
              <div key={ticket.id} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => router.push(`/asha/tickets/${ticket.id}`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                      <span className="font-bold text-sm" style={{ color: 'var(--color-primary-700)' }}>{ticket.id}</span>
                      <span className={`badge ${ticket.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ticket.priority}</span>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                    </div>
                    <div className="font-semibold" style={{ marginBottom: 2 }}>{ticket.patientName}</div>
                    <div className="text-sm text-secondary">{ticket.concern}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>Created {ticket.createdDate} by {ticket.createdBy}</div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', marginTop: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
