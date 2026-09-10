'use client';

import { DEMO_REFERRALS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { useState } from 'react';

const STATUS_LABELS = {
  'pending': { label: 'Pending', badge: 'badge-warning' },
  'accepted': { label: 'Accepted', badge: 'badge-info' },
  'in-review': { label: 'In Review', badge: 'badge-primary' },
  'completed': { label: 'Completed', badge: 'badge-success' },
  'cancelled': { label: 'Cancelled', badge: 'badge-neutral' },
};

export default function AshaReferrals() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? DEMO_REFERRALS
    : DEMO_REFERRALS.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Referrals</h1>
          <p className="page-subtitle">SevaConnect - Referral tracking and management</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> New Referral</button>
      </div>

      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'in-review', label: 'In Review' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'completed', label: 'Completed' },
        ].map(f => (
          <button key={f.key} className={`tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><ArrowRightLeft /></div>
            <p className="empty-state-title">No pending referrals</p>
            <p className="empty-state-text">No referrals match the selected filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(ref => {
            const status = STATUS_LABELS[ref.status] || { label: ref.status, badge: 'badge-neutral' };
            return (
              <div key={ref.id} className="card" style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span className="font-bold text-sm">{ref.id}</span>
                      <span className={`badge ${ref.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ref.priority}</span>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                    </div>
                    <div className="font-semibold">{ref.patientName}</div>
                    <div className="text-sm text-secondary" style={{ marginTop: 2 }}>{ref.reason}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      Destination: {ref.destination} | Created: {ref.createdDate}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={() => router.push(`/asha/patients/${ref.patientId}`)}>
                    View Patient
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
