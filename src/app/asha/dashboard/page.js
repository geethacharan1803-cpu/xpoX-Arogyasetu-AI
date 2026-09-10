'use client';

import { useAuth } from '@/lib/auth-context';
import { DEMO_PATIENTS, DEMO_HEALTH_TICKETS, DEMO_REFERRALS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, ArrowRightLeft, CalendarCheck, Heart,
  AlertTriangle, RefreshCw, ChevronRight, Clock
} from 'lucide-react';

export default function AshaDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const pregnantWomen = DEMO_PATIENTS.filter(p => p.isPregnant);
  const pendingReferrals = DEMO_REFERRALS.filter(r => r.status === 'pending' || r.status === 'in-review');
  const todayFollowups = DEMO_FOLLOWUPS.filter(f => f.status === 'due-today');
  const overdueFollowups = DEMO_FOLLOWUPS.filter(f => f.status === 'overdue');
  const highPriorityTickets = DEMO_HEALTH_TICKETS.filter(t => t.priority === 'high' && t.status !== 'follow-up-scheduled');
  const recentPatients = [...DEMO_PATIENTS].sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)).slice(0, 5);

  const stats = [
    { label: 'Today\'s Follow-ups', value: todayFollowups.length, icon: CalendarCheck, color: 'primary' },
    { label: 'Overdue Follow-ups', value: overdueFollowups.length, icon: AlertTriangle, color: overdueFollowups.length > 0 ? 'danger' : 'success' },
    { label: 'Pending Referrals', value: pendingReferrals.length, icon: ArrowRightLeft, color: 'warning' },
    { label: 'Pregnant Women', value: pregnantWomen.length, icon: Heart, color: 'info' },
    { label: 'Total Patients', value: DEMO_PATIENTS.length, icon: Users, color: 'primary' },
    { label: 'High Priority', value: highPriorityTickets.length, icon: AlertTriangle, color: highPriorityTickets.length > 0 ? 'danger' : 'success' },
  ];

  const pendingActions = [
    ...overdueFollowups.map(f => ({ type: 'urgent', text: `Overdue: ${f.patientName} - ${f.reason}`, time: f.dueDate, link: '/asha/followups' })),
    ...todayFollowups.map(f => ({ type: 'warning', text: `Due today: ${f.patientName} - ${f.reason}`, time: 'Today', link: '/asha/followups' })),
    ...pendingReferrals.map(r => ({ type: 'normal', text: `Referral pending: ${r.patientName} - ${r.reason}`, time: r.createdDate, link: '/asha/referrals' })),
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name || 'ASHA Worker'}. Here is your daily overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div className="stat-card" key={i}>
              <div className={`stat-card-icon ${stat.color}`}>
                <Icon size={18} />
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Pending Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Actions</h2>
            <span className="badge badge-warning">{pendingActions.length}</span>
          </div>
          {pendingActions.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <p className="empty-state-text">No pending actions. Great work!</p>
            </div>
          ) : (
            <div className="action-list">
              {pendingActions.slice(0, 6).map((action, i) => (
                <div key={i} className="action-item" onClick={() => router.push(action.link)}>
                  <div className={`action-item-dot ${action.type}`} />
                  <span className="action-item-text">{action.text}</span>
                  <span className="action-item-time">{action.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Patients</h2>
            <button className="btn btn-sm btn-secondary" onClick={() => router.push('/asha/patients')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="patient-card"
                onClick={() => router.push(`/asha/patients/${patient.id}`)}
              >
                <div className="patient-avatar">
                  {patient.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                </div>
                <div className="patient-info">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-meta">
                    {patient.id} &middot; {patient.age}y {patient.gender} &middot; {patient.village}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {patient.isPregnant && <span className="badge badge-info">Pregnant</span>}
                  {patient.conditions.some(c => c.includes('Diabetes') || c.includes('Hypertension')) && (
                    <span className="badge badge-warning">Chronic</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Locality Summary */}
      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card-header">
          <h2 className="card-title">Locality Summary — {user?.area || 'Assigned Area'}</h2>
        </div>
        <div className="stats-grid" style={{ marginBottom: 0 }}>
          <div className="stat-card">
            <div className="stat-card-value">{DEMO_PATIENTS.length}</div>
            <div className="stat-card-label">Registered Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{pregnantWomen.length}</div>
            <div className="stat-card-label">Pregnant Women</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{DEMO_PATIENTS.filter(p => p.age < 18).length}</div>
            <div className="stat-card-label">Children</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{overdueFollowups.length + todayFollowups.length}</div>
            <div className="stat-card-label">Pending Follow-ups</div>
          </div>
        </div>
      </div>
    </div>
  );
}
