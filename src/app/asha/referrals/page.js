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
  const [referrals, setReferrals] = useState(DEMO_REFERRALS);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: 'P-2026-001',
    patientName: 'Lakshmi Devi',
    reason: '',
    priority: 'high',
    destination: 'PHC Rampur',
  });

  const filtered = filter === 'all'
    ? referrals
    : referrals.filter(r => r.status === filter);

  const handleCreateReferral = (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;

    const newRef = {
      id: `REF-2026-${String(referrals.length + 1).padStart(3, '0')}`,
      ticketId: `HT-2026-000${130 + referrals.length}`,
      patientId: formData.patientId,
      patientName: formData.patientName,
      reason: formData.reason,
      priority: formData.priority,
      destination: formData.destination,
      createdDate: 'Today',
      createdBy: 'ASHA Priya',
      status: 'pending',
    };

    setReferrals([newRef, ...referrals]);
    setShowModal(false);
    setFormData({
      patientId: 'P-2026-001',
      patientName: 'Lakshmi Devi',
      reason: '',
      priority: 'high',
      destination: 'PHC Rampur',
    });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Referrals</h1>
          <p className="page-subtitle">SevaConnect - Referral tracking and management</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Referral
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-md)'
        }}>
          <div className="card" style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Create New Referral</h3>
            <form onSubmit={handleCreateReferral}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-input"
                  value={formData.patientId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const name = id === 'P-2026-001' ? 'Lakshmi Devi' : id === 'P-2026-002' ? 'Rajesh Kumar' : 'Sunita Sharma';
                    setFormData({ ...formData, patientId: id, patientName: name });
                  }}
                >
                  <option value="P-2026-001">Lakshmi Devi (P-2026-001) - Rampur</option>
                  <option value="P-2026-002">Rajesh Kumar (P-2026-002) - Rampur</option>
                  <option value="P-2026-003">Sunita Sharma (P-2026-003) - Shivpur</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination Facility</label>
                <select
                  className="form-input"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                >
                  <option value="PHC Rampur">PHC Rampur (Primary Health Centre)</option>
                  <option value="CHC Shivpur">CHC Shivpur (Community Health Centre)</option>
                  <option value="District Hospital Hyderabad">District Hospital Hyderabad</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {['high', 'medium', 'low'].map(p => (
                    <button
                      type="button"
                      key={p}
                      className={`btn btn-sm ${formData.priority === p ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setFormData({ ...formData, priority: p })}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Referral</label>
                <textarea
                  className="form-input"
                  rows={3}
                  required
                  placeholder="Clinical observation, red flag symptoms, or required tests..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <p className="empty-state-title">No referrals</p>
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
