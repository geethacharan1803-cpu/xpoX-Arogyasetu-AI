'use client';

import { useAuth } from '@/lib/auth-context';
import { DEMO_REFERRALS, DEMO_HEALTH_TICKETS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, FileText, AlertTriangle, CalendarCheck, ChevronRight } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const newReferrals = DEMO_REFERRALS.filter(r => r.status === 'pending' || r.status === 'in-review');
  const highPriority = DEMO_HEALTH_TICKETS.filter(t => t.priority === 'high');
  const pendingReviews = DEMO_HEALTH_TICKETS.filter(t => t.status === 'referred');
  const followups = DEMO_FOLLOWUPS.filter(f => f.status === 'due-today' || f.status === 'overdue');

  const stats = [
    { label: 'New Referrals', value: newReferrals.length, icon: ArrowRightLeft, color: 'warning' },
    { label: 'High Priority', value: highPriority.length, icon: AlertTriangle, color: 'danger' },
    { label: 'Pending Reviews', value: pendingReviews.length, icon: FileText, color: 'info' },
    { label: 'Follow-ups Due', value: followups.length, icon: CalendarCheck, color: 'primary' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.name || 'Doctor'}. Here are your pending tasks.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div className="stat-card" key={i}>
              <div className={`stat-card-icon ${stat.color}`}><Icon size={18} /></div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Referrals needing review */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Referrals Needing Review</h2>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/doctor/referrals')}>View All</button>
          </div>
          {newReferrals.length === 0 ? (
            <div className="empty-state"><p className="empty-state-text">No pending referrals.</p></div>
          ) : (
            <div className="action-list">
              {newReferrals.map(ref => (
                <div key={ref.id} className="action-item" onClick={() => router.push(`/doctor/referrals`)}>
                  <div className={`action-item-dot ${ref.priority === 'high' ? 'urgent' : 'normal'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{ref.patientName}</div>
                    <div className="text-xs text-muted">{ref.reason}</div>
                  </div>
                  <span className={`badge ${ref.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ref.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending ticket reviews */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tickets Pending Review</h2>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/doctor/tickets')}>View All</button>
          </div>
          {pendingReviews.length === 0 ? (
            <div className="empty-state"><p className="empty-state-text">No pending reviews.</p></div>
          ) : (
            <div className="action-list">
              {pendingReviews.map(t => (
                <div key={t.id} className="action-item" onClick={() => router.push(`/doctor/tickets`)}>
                  <div className={`action-item-dot ${t.priority === 'high' ? 'urgent' : 'normal'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{t.patientName} - {t.id}</div>
                    <div className="text-xs text-muted">{t.concern}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
