'use client';
import { DEMO_PATIENTS, DEMO_REFERRALS, DEMO_HEALTH_TICKETS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { BarChart3 } from 'lucide-react';

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
    </div>
  );
}
