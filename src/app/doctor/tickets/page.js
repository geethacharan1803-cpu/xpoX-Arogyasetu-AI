'use client';

import { useRouter } from 'next/navigation';
import { FileText, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DoctorTickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const d = await res.json();
          setTickets(d.tickets || []);
        }
      } catch (e) {
        console.error('Error fetching tickets:', e);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Health Tickets Review Desk</h1>
        <p className="page-subtitle">Review community triage tickets &bull; Database Records</p>
      </div>

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading health tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card"><div className="empty-state"><p className="empty-state-title">No health tickets</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {tickets.map(t => (
            <div
              key={t.id}
              className="card"
              style={{ padding: 'var(--space-md)', cursor: 'pointer' }}
              onClick={() => router.push(`/doctor/patients/${t.patientId}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-primary-700)' }}>{t.id}</span>
                    <span className={`badge ${t.priority === 'high' ? 'badge-danger' : 'badge-primary'}`}>{t.priority}</span>
                    <span className="badge badge-neutral">{t.status}</span>
                  </div>
                  <div className="font-semibold">{t.patientName} ({t.patientId})</div>
                  <div className="text-sm text-secondary">{t.concern}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="text-xs text-muted">Review Dossier</span>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
