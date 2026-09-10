'use client';

import { DEMO_HEALTH_TICKETS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { FileText, ChevronRight } from 'lucide-react';

export default function DoctorTickets() {
  const router = useRouter();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Health Tickets</h1>
        <p className="page-subtitle">Review and manage health tickets</p>
      </div>

      {DEMO_HEALTH_TICKETS.length === 0 ? (
        <div className="card"><div className="empty-state"><p className="empty-state-title">No health tickets</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {DEMO_HEALTH_TICKETS.map(t => (
            <div key={t.id} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => router.push(`/doctor/tickets/${t.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-primary-700)' }}>{t.id}</span>
                    <span className={`badge ${t.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{t.priority}</span>
                  </div>
                  <div className="font-semibold">{t.patientName}</div>
                  <div className="text-sm text-secondary">{t.concern}</div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
