'use client';
import { DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Clock, AlertTriangle } from 'lucide-react';

export default function DoctorFollowups() {
  const router = useRouter();
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Follow-ups</h1>
        <p className="page-subtitle">Patient follow-up schedule</p>
      </div>
      {DEMO_FOLLOWUPS.length === 0 ? (
        <div className="card"><div className="empty-state"><p className="empty-state-title">No follow-ups scheduled</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {DEMO_FOLLOWUPS.map(fu => (
            <div key={fu.id} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => router.push(`/doctor/patients/${fu.patientId}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <div>
                  <div className="font-semibold">{fu.patientName}</div>
                  <div className="text-sm text-secondary">{fu.reason}</div>
                  <div className="text-xs text-muted">Due: {fu.dueDate} | {fu.type}</div>
                </div>
                <span className={`badge ${fu.status === 'overdue' ? 'badge-danger' : fu.status === 'due-today' ? 'badge-warning' : 'badge-info'}`}>
                  {fu.status === 'overdue' ? 'Overdue' : fu.status === 'due-today' ? 'Due Today' : 'Upcoming'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
