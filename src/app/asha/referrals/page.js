'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightLeft, Plus, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

const STATUS_LABELS = {
  'pending': { label: 'Pending', badge: 'badge-warning' },
  'accepted': { label: 'Accepted', badge: 'badge-info' },
  'in-review': { label: 'In Review', badge: 'badge-primary' },
  'completed': { label: 'Completed', badge: 'badge-success' },
  'cancelled': { label: 'Cancelled', badge: 'badge-neutral' },
};

export default function AshaReferrals() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [referrals, setReferrals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    reason: '',
    priority: 'high',
    destination: 'PHC Rampur',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [refsRes, ptsRes] = await Promise.all([
        fetch('/api/referrals'),
        fetch('/api/patients')
      ]);

      if (refsRes.ok) {
        const d = await refsRes.json();
        setReferrals(d.referrals || []);
      }
      if (ptsRes.ok) {
        const pData = await ptsRes.json();
        setPatients(pData.patients || []);
        if (pData.patients && pData.patients.length > 0 && !formData.patientId) {
          setFormData(prev => ({ ...prev, patientId: pData.patients[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading referrals:', err);
    } finally {
      setLoading(false);
    }
  }, [formData.patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = filter === 'all'
    ? referrals
    : referrals.filter(r => r.status === filter);

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId) || patients[0];
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient?.id,
          patientName: selectedPatient?.name,
          reason: formData.reason,
          priority: formData.priority,
          destination: formData.destination,
          createdBy: user?.name || 'ASHA Priya',
        }),
      });

      if (!res.ok) throw new Error('Failed to create referral');

      setShowModal(false);
      setFormData({
        patientId: patients[0]?.id || '',
        reason: '',
        priority: 'high',
        destination: 'PHC Rampur',
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError('Unable to create referral. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Referrals</h1>
          <p className="page-subtitle">{referrals.length} referrals recorded in database</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); }}>
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
          <div className="card" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>New Clinical Referral</h3>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-md)' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReferral}>
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select
                  className="form-input"
                  value={formData.patientId}
                  onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id}) &mdash; {p.village}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Referral *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  required
                  placeholder="Clinical reason, symptoms observed, urgency rationale..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Facility</label>
                  <select
                    className="form-input"
                    value={formData.destination}
                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  >
                    <option value="PHC Rampur">PHC Rampur</option>
                    <option value="District Hospital Hyderabad">District Hospital</option>
                    <option value="Community Health Centre">Community Health Centre</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving to Database...' : 'Create Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {['all', 'pending', 'accepted', 'in-review', 'completed'].map(key => (
          <button
            key={key}
            className={`tab ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')} ({key === 'all' ? referrals.length : referrals.filter(r => r.status === key).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading referrals from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ArrowRightLeft size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-sm)' }} />
            <p className="empty-state-title">No referrals found</p>
            <p className="empty-state-text">No referrals matching this filter in the database.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    <span className="font-semibold text-sm">{r.id}</span>
                    <span className={`badge ${STATUS_LABELS[r.status]?.badge || 'badge-neutral'}`}>
                      {STATUS_LABELS[r.status]?.label || r.status}
                    </span>
                    <span className={`badge ${r.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{r.priority}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginTop: 'var(--space-xs)', marginBottom: 2 }}>{r.reason}</h3>
                  <p className="text-xs text-muted">
                    Patient: <strong>{r.patientName}</strong> ({r.patientId}) &bull; Destination: <strong>{r.destination}</strong> &bull; Created: {r.createdDate} by {r.createdBy}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => router.push(`/asha/patients/${r.patientId}`)}
                >
                  View Patient <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
