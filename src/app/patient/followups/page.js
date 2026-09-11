'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';

export default function PatientFollowups() {
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowups() {
      const pid = user?.patientId || 'P-2026-001';
      try {
        const res = await fetch(`/api/followups?patientId=${pid}`);
        if (res.ok) {
          const d = await res.json();
          setFollowups(d.followups || []);
        }
      } catch (err) {
        console.error('Error fetching patient follow-ups:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFollowups();
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Follow-ups</h1>
        <p className="page-subtitle">Your scheduled checkup appointments &bull; Database Records</p>
      </div>

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading your appointments...</span>
        </div>
      ) : followups.length === 0 ? (
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
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>Due Date: {fu.dueDate} &bull; Assigned to: {fu.assignedTo}</div>
                </div>
                <span className={`badge ${fu.status === 'overdue' ? 'badge-danger' : fu.status === 'due-today' ? 'badge-warning' : fu.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                  {fu.status === 'overdue' ? 'Overdue' : fu.status === 'due-today' ? 'Due Today' : fu.status === 'completed' ? 'Completed' : 'Upcoming'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
