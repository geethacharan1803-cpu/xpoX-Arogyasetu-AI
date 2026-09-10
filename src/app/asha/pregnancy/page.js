'use client';

import { DEMO_PATIENTS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { Heart, AlertTriangle, CalendarCheck, ChevronRight } from 'lucide-react';

export default function PregnancyDashboard() {
  const router = useRouter();
  const pregnant = DEMO_PATIENTS.filter(p => p.isPregnant);
  const highPriority = pregnant.filter(p => p.conditions.some(c => c.includes('Gestational') || c.includes('Anemia')) || p.pregnancyWeek >= 36);
  const upcomingFollowups = DEMO_FOLLOWUPS.filter(f => f.type === 'ANC Visit' && (f.status === 'upcoming' || f.status === 'due-today'));
  const overdueFollowups = DEMO_FOLLOWUPS.filter(f => f.type === 'ANC Visit' && f.status === 'overdue');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pregnancy Monitoring</h1>
        <p className="page-subtitle">Track and monitor all pregnant women in your area</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon info"><Heart size={18} /></div>
          <div className="stat-card-value">{pregnant.length}</div>
          <div className="stat-card-label">Total Pregnant Women</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon danger"><AlertTriangle size={18} /></div>
          <div className="stat-card-value">{highPriority.length}</div>
          <div className="stat-card-label">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon primary"><CalendarCheck size={18} /></div>
          <div className="stat-card-value">{upcomingFollowups.length}</div>
          <div className="stat-card-label">Upcoming Follow-ups</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon warning"><CalendarCheck size={18} /></div>
          <div className="stat-card-value">{overdueFollowups.length}</div>
          <div className="stat-card-label">Missed Follow-ups</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Pregnant Women</h3>
        <div className="table-container">
          <table className="table-responsive">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Week</th>
                <th>EDD</th>
                <th>Conditions</th>
                <th>Last Visit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pregnant.map(p => {
                const isHigh = p.conditions.some(c => c.includes('Gestational') || c.includes('Anemia')) || p.pregnancyWeek >= 36;
                return (
                  <tr key={p.id} className="clickable-row" onClick={() => router.push(`/asha/patients/${p.id}`)}>
                    <td data-label="Name"><strong>{p.name}</strong><br /><span className="text-xs text-muted">{p.id}</span></td>
                    <td data-label="Age">{p.age}y</td>
                    <td data-label="Week">Week {p.pregnancyWeek}</td>
                    <td data-label="EDD">{p.edd}</td>
                    <td data-label="Conditions">
                      {p.conditions.map((c, i) => (
                        <span key={i} className={`badge ${c.includes('Gestational') ? 'badge-danger' : c.includes('Anemia') ? 'badge-warning' : 'badge-info'}`} style={{ marginRight: 4, marginBottom: 2 }}>{c}</span>
                      ))}
                    </td>
                    <td data-label="Last Visit">{p.lastVisit}</td>
                    <td data-label="Status">
                      <span className={`badge ${isHigh ? 'badge-danger' : 'badge-success'}`}>
                        {isHigh ? 'High Risk' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pregnant.length === 0 && (
          <div className="empty-state"><p className="empty-state-text">No pregnant women registered.</p></div>
        )}
      </div>
    </div>
  );
}
