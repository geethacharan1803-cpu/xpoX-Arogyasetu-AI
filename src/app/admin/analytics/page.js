'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Clock, AlertCircle, Users, RefreshCw } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {};
  const metrics = [
    { label: 'Total Patients', value: stats.totalPatients ?? '...' },
    { label: 'Pregnant Women', value: stats.pregnantWomen ?? '...' },
    { label: 'Children (under 18)', value: stats.children ?? '...' },
    { label: 'Chronic Conditions', value: stats.chronicConditions ?? '...' },
    { label: 'Total Tickets', value: stats.totalTickets ?? '...' },
    { label: 'High Priority Tickets', value: stats.highPriorityTickets ?? '...' },
    { label: 'Active Referrals', value: stats.activeReferrals ?? '...' },
    { label: 'Completed Referrals', value: stats.completedReferrals ?? '...' },
    { label: 'Pending Follow-ups', value: stats.pendingFollowups ?? '...' },
    { label: 'Overdue Follow-ups', value: stats.overdueFollowups ?? '...' },
  ];

  const totalFollowups = (stats.pendingFollowups || 0) + (stats.overdueFollowups || 0);
  const overdueRate = totalFollowups > 0 ? Math.round(((stats.overdueFollowups || 0) / totalFollowups) * 100) : 0;
  const ashaDistribution = data?.ashaDistribution || [];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Health System Analytics</h1>
          <p className="page-subtitle">Real-time district healthcare telemetry &amp; indicators</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      <div className="stats-grid">
        {metrics.map((m, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-value">{m.value}</div>
            <div className="stat-card-label">{m.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
        Care Coordination Efficiency
      </h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon info"><Clock size={18} /></div>
          <div className="stat-card-value">24h</div>
          <div className="stat-card-label">Avg Referral Turnaround</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon warning"><AlertCircle size={18} /></div>
          <div className="stat-card-value">{overdueRate}%</div>
          <div className="stat-card-label">Overdue Follow-up Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon primary"><Users size={18} /></div>
          <div className="stat-card-value">{stats.totalPatients ?? 0}</div>
          <div className="stat-card-label">Patients in Coverage Area</div>
        </div>
      </div>

      {ashaDistribution.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-md)' }}>
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Field Worker Patient Registry</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {ashaDistribution.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-sm font-medium">{a.worker}</span>
                <span className="font-bold">{a.count} patients registered</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

