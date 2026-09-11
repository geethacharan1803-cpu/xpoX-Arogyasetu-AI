'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, User, FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const STATUS_LABELS = {
  'pending': { label: 'Pending', badge: 'badge-warning' },
  'accepted': { label: 'Accepted', badge: 'badge-info' },
  'in-review': { label: 'In Review', badge: 'badge-primary' },
  'completed': { label: 'Completed', badge: 'badge-success' },
};

export default function DoctorReferrals() {
  const router = useRouter();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [acceptedNotice, setAcceptedNotice] = useState('');

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const d = await res.json();
        setReferrals(d.referrals || []);
      }
    } catch (err) {
      console.error('Error fetching doctor referrals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const handleUpdateStatus = async (refId, newStatus) => {
    try {
      const res = await fetch('/api/referrals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: refId,
          status: newStatus,
          updatedBy: user?.name || 'Dr. Sharma',
        }),
      });

      if (res.ok) {
        setReferrals(prev => prev.map(r => r.id === refId ? { ...r, status: newStatus } : r));
        setAcceptedNotice(`Referral ${refId} status updated to ${newStatus.toUpperCase()}.`);
        setTimeout(() => setAcceptedNotice(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update referral:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Referrals Review Desk</h1>
        <p className="page-subtitle">Review and manage clinical patient referrals from database</p>
      </div>

      {acceptedNotice && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>
          <CheckCircle size={18} />
          <span>{acceptedNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading referrals from database...</span>
        </div>
      ) : referrals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">No referrals</p>
            <p className="empty-state-text">No active clinical referrals in the system.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {referrals.map(ref => {
            const status = STATUS_LABELS[ref.status] || { label: ref.status, badge: 'badge-neutral' };
            const isExpanded = expandedId === ref.id;

            return (
              <div key={ref.id} className="card" style={{ padding: 'var(--space-md)' }}>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : ref.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 4 }}>
                      <span className="font-bold text-sm">{ref.id}</span>
                      <span className={`badge ${ref.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ref.priority}</span>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                    </div>
                    <div className="font-semibold">{ref.patientName} ({ref.patientId})</div>
                    <div className="text-sm text-secondary">{ref.reason}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      Referred by: {ref.createdBy} &bull; Destination: {ref.destination} &bull; Date: {ref.createdDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/doctor/patients/${ref.patientId}`);
                      }}
                    >
                      View Dossier <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                      {ref.status !== 'accepted' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleUpdateStatus(ref.id, 'accepted')}
                        >
                          Accept Referral
                        </button>
                      )}
                      {ref.status !== 'completed' && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleUpdateStatus(ref.id, 'completed')}
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
