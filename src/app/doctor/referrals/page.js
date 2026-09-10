'use client';

import { DEMO_REFERRALS, getPatientById } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRightLeft, User, FileText, CheckCircle } from 'lucide-react';

export default function DoctorReferrals() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const STATUS_LABELS = {
    'pending': { label: 'Pending', badge: 'badge-warning' },
    'accepted': { label: 'Accepted', badge: 'badge-info' },
    'in-review': { label: 'In Review', badge: 'badge-primary' },
    'completed': { label: 'Completed', badge: 'badge-success' },
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Referrals</h1>
        <p className="page-subtitle">Review and manage patient referrals</p>
      </div>

      {DEMO_REFERRALS.length === 0 ? (
        <div className="card"><div className="empty-state"><p className="empty-state-title">No referrals</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {DEMO_REFERRALS.map(ref => {
            const patient = getPatientById(ref.patientId);
            const status = STATUS_LABELS[ref.status] || { label: ref.status, badge: 'badge-neutral' };
            const isExpanded = expandedId === ref.id;

            return (
              <div key={ref.id} className="card" style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : ref.id)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 4 }}>
                      <span className="font-bold text-sm">{ref.id}</span>
                      <span className={`badge ${ref.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ref.priority}</span>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                    </div>
                    <div className="font-semibold">{ref.patientName}</div>
                    <div className="text-sm text-secondary">{ref.reason}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>From: {ref.createdBy} | {ref.createdDate}</div>
                  </div>
                </div>

                {isExpanded && patient && (
                  <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <h4 className="font-semibold text-sm" style={{ marginBottom: 'var(--space-sm)' }}>Patient Details</h4>
                    <div className="info-grid">
                      <span className="info-label">Name</span><span className="info-value">{patient.name}</span>
                      <span className="info-label">Age / Gender</span><span className="info-value">{patient.age}y {patient.gender}</span>
                      <span className="info-label">Conditions</span><span className="info-value">{patient.conditions.join(', ')}</span>
                      <span className="info-label">Allergies</span><span className="info-value">{patient.allergies.join(', ')}</span>
                      <span className="info-label">Village</span><span className="info-value">{patient.village}</span>
                    </div>

                    {patient.vitals[0] && (
                      <div style={{ marginTop: 'var(--space-md)' }}>
                        <h4 className="font-semibold text-sm" style={{ marginBottom: 'var(--space-sm)' }}>Latest Vitals</h4>
                        <div className="info-grid">
                          <span className="info-label">BP</span><span className="info-value">{patient.vitals[0].bp}</span>
                          <span className="info-label">Pulse</span><span className="info-value">{patient.vitals[0].pulse} bpm</span>
                          <span className="info-label">SpO2</span><span className="info-value">{patient.vitals[0].spo2}%</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm"><CheckCircle size={14} /> Accept Referral</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/doctor/patients`)}>
                        <User size={14} /> Full Profile
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => router.push('/doctor/prescriptions')}>
                        <FileText size={14} /> Add Prescription
                      </button>
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
