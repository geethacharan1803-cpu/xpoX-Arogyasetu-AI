'use client';

import { useAuth } from '@/lib/auth-context';
import { DEMO_PATIENTS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { CalendarCheck } from 'lucide-react';

export default function PatientFollowups() {
  const { user } = useAuth();
  const patient = DEMO_PATIENTS.find(p => p.id === user?.patientId) || DEMO_PATIENTS[0];
  const followups = DEMO_FOLLOWUPS.filter(f => f.patientId === patient.id);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Follow-ups</h1>
        <p className="page-subtitle">Your upcoming and past appointments</p>
      </div>

      {followups.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><CalendarCheck /></div>
            <p className="empty-state-title">No follow-ups scheduled</p>
            <p className="empty-state-text">You do not have any upcoming follow-up visits.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {followups.map(fu => (
            <div key={fu.id} className="card" style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <div>
                  <div className="font-semibold">{fu.type}</div>
                  <div className="text-sm text-secondary">{fu.reason}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>Date: {fu.dueDate}</div>
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
