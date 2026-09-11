'use client';
import { DEMO_PATIENTS, DEMO_REFERRALS, DEMO_HEALTH_TICKETS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { BarChart3, Clock, AlertCircle, Users } from 'lucide-react';
import { avgReferralTurnaroundHours, overdueFollowupRate, patientsPerAshaWorker } from '@/lib/analytics';

export default function AdminAnalytics() {
  const metrics = [
    { label: 'Total Patients', value: DEMO_PATIENTS.length },
    { label: 'Pregnant Women', value: DEMO_PATIENTS.filter(p => p.isPregnant).length },
    { label: 'Children (under 18)', value: DEMO_PATIENTS.filter(p => p.age < 18).length },
    { label: 'Chronic Conditions', value: DEMO_PATIENTS.filter(p => p.conditions.some(c => c.includes('Diabetes') || c.includes('Hypertension'))).length },
    { label: 'Total Tickets', value: DEMO_HEALTH_TICKETS.length },
    { label: 'High Priority Tickets', value: DEMO_HEALTH_TICKETS.filter(t => t.priority === 'high').length },
    { label: 'Total Referrals', value: DEMO_REFERRALS.length },
    { label: 'Completed Referrals', value: DEMO_REFERRALS.filter(r => r.status === 'completed').length },
    { label: 'Pending Follow-ups', value: DEMO_FOLLOWUPS.filter(f => f.status !== 'completed').length },
    { label: 'Overdue Follow-ups', value: DEMO_FOLLOWUPS.filter(f => f.status === 'overdue').length },
  ];

  // Feature 4 — Referral Turnaround Analytics
  const turnaroundHours = avgReferralTurnaroundHours(DEMO_REFERRALS);
  const overdueRate = overdueFollowupRate(DEMO_FOLLOWUPS);
  const ashaDistribution = patientsPerAshaWorker(DEMO_PATIENTS);
  const topAshaLine = ashaDistribution.length > 0
    ? `${ashaDistribution[0].worker}: ${ashaDistribution[0].count}`
    : 'N/A';

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Analytics</h1><p className="page-subtitle">System-wide metrics and statistics</p></div>
      <div className="alert alert-info"><BarChart3 size={18} /><span>DEMO DATA - Analytics are computed from demonstration data only.</span></div>
      <div className="stats-grid">
        {metrics.map((m, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-value">{m.value}</div>
            <div className="stat-card-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Feature 4 — Referral Turnaround Analytics */}
      <h3 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
        Referral &amp; Follow-up Analytics
      </h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon info"><Clock size={18} /></div>
          <div className="stat-card-value">{turnaroundHours !== null ? `${turnaroundHours}h` : 'N/A'}</div>
          <div className="stat-card-label">Avg Referral Turnaround</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon warning"><AlertCircle size={18} /></div>
          <div className="stat-card-value">{overdueRate}%</div>
          <div className="stat-card-label">Overdue Follow-up Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon primary"><Users size={18} /></div>
          <div className="stat-card-value">{ashaDistribution.reduce((s, a) => s + a.count, 0)}</div>
          <div className="stat-card-label">Patients per ASHA Worker</div>
        </div>
      </div>
      {ashaDistribution.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-md)' }}>
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>ASHA Worker Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {ashaDistribution.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-sm">{a.worker}</span>
                <span className="font-bold">{a.count} patients</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
