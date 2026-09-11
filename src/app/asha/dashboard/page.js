'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Users, FileText, ArrowRightLeft, CalendarCheck, Heart,
  AlertTriangle, RefreshCw, ChevronRight, Clock
} from 'lucide-react';

export default function AshaDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [ptsRes, tksRes, refsRes, fusRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/tickets'),
          fetch('/api/referrals'),
          fetch('/api/followups')
        ]);

        if (ptsRes.ok) {
          const d = await ptsRes.json();
          setPatients(d.patients || []);
        }
        if (tksRes.ok) {
          const d = await tksRes.json();
          setTickets(d.tickets || []);
        }
        if (refsRes.ok) {
          const d = await refsRes.json();
          setReferrals(d.referrals || []);
        }
        if (fusRes.ok) {
          const d = await fusRes.json();
          setFollowups(d.followups || []);
        }
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const pregnantWomen = patients.filter(p => p.isPregnant);
  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'in-review');
  const todayFollowups = followups.filter(f => f.status === 'due-today');
  const overdueFollowups = followups.filter(f => f.status === 'overdue');
  const highPriorityTickets = tickets.filter(t => t.priority === 'high' && t.status !== 'follow-up-scheduled');
  const recentPatients = patients.slice(0, 5);

  const stats = [
    { label: "Today's Follow-ups", value: todayFollowups.length, icon: CalendarCheck, color: 'primary' },
    { label: 'Overdue Follow-ups', value: overdueFollowups.length, icon: AlertTriangle, color: overdueFollowups.length > 0 ? 'danger' : 'success' },
    { label: 'Pending Referrals', value: pendingReferrals.length, icon: ArrowRightLeft, color: 'warning' },
    { label: 'Pregnant Women', value: pregnantWomen.length, icon: Heart, color: 'info' },
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'primary' },
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
        <h1 className="page-title">ASHA Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name || 'ASHA Worker'}. Here is your community health overview.</p>
      </div>

      {loading && (
        <div style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          Syncing with database records...
        </div>
      )}

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
            {recentPatients.length === 0 ? (
              <p className="text-sm text-muted">No patients registered yet.</p>
            ) : (
              recentPatients.map((patient) => (
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
                  </div>
                </div>
              ))
            )}
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
            <div className="stat-card-value">{patients.length}</div>
            <div className="stat-card-label">Registered Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{pregnantWomen.length}</div>
            <div className="stat-card-label">Pregnant Women</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{patients.filter(p => p.age < 18).length}</div>
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
