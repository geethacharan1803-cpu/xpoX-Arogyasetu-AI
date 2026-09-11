'use client';

import { DEMO_PATIENTS, DEMO_REFERRALS, DEMO_HEALTH_TICKETS, DEMO_FOLLOWUPS, DEMO_FACILITIES } from '@/lib/demo-data';
import { useAuth } from '@/lib/auth-context';
import { Building2, Users, ArrowRightLeft, BarChart3, FileText, Heart, AlertTriangle } from 'lucide-react';
import { detectClusters } from '@/lib/outbreak-detection';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Patients', value: DEMO_PATIENTS.length, icon: Users, color: 'primary' },
    { label: 'Health Tickets', value: DEMO_HEALTH_TICKETS.length, icon: FileText, color: 'info' },
    { label: 'Active Referrals', value: DEMO_REFERRALS.filter(r => r.status !== 'completed').length, icon: ArrowRightLeft, color: 'warning' },
    { label: 'Healthcare Facilities', value: DEMO_FACILITIES.length, icon: Building2, color: 'primary' },
    { label: 'Pregnant Women', value: DEMO_PATIENTS.filter(p => p.isPregnant).length, icon: Heart, color: 'info' },
    { label: 'Pending Follow-ups', value: DEMO_FOLLOWUPS.filter(f => f.status !== 'completed').length, icon: BarChart3, color: 'warning' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview for {user?.name || 'Administrator'}</p>
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
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>PHC Summary</h3>
          <div className="table-container">
            <table>
              <thead><tr><th>Facility</th><th>Type</th><th>Doctors</th></tr></thead>
              <tbody>
                {DEMO_FACILITIES.map(f => (
                  <tr key={f.id}><td>{f.name}</td><td><span className="badge badge-primary">{f.type}</span></td><td>{f.doctors.length || 'Staff'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Referral Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {['pending', 'in-review', 'accepted', 'completed'].map(status => {
              const count = DEMO_REFERRALS.filter(r => r.status === status).length;
              const label = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="text-sm">{label}</span>
                  <span className="font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Possible Outbreak Alerts — Feature 2 */}
      {(() => {
        const clusters = detectClusters(DEMO_HEALTH_TICKETS, DEMO_PATIENTS);
        return (
          <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
              <h3 className="card-title" style={{ marginBottom: 0 }}>Possible Outbreak Alerts</h3>
            </div>
            {clusters.length === 0 ? (
              <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p className="text-sm text-secondary">No clusters detected — fewer than 3 patients with similar symptoms in the same village within the last 7 days.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {clusters.map((cluster, idx) => (
                  <div key={idx} style={{ padding: 'var(--space-md)', background: 'var(--color-warning-light)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-warning)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                      <span className="badge badge-warning">⚠ Cluster</span>
                      <span className="font-bold text-sm">{cluster.symptom.charAt(0).toUpperCase() + cluster.symptom.slice(1)}</span>
                      <span className="text-sm text-secondary">in {cluster.village}</span>
                    </div>
                    <div style={{ marginTop: 'var(--space-xs)' }}>
                      <span className="text-sm">{cluster.patientCount} patients affected — first reported {cluster.firstReported}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
