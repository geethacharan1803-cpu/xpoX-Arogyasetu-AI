'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Mic, BookOpen, FileText, CalendarCheck, Heart,
  Pill, Activity, Volume2, ShieldCheck
} from 'lucide-react';

export default function PatientHome() {
  const { user } = useAuth();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatientRecord() {
      const pid = user?.patientId || 'P-2026-001';
      try {
        const res = await fetch(`/api/patients/${pid}`);
        if (res.ok) {
          const d = await res.json();
          setPatient(d.patient);
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientRecord();
  }, [user]);

  const speak = (text, lang = 'en-IN') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading your personal health records...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="card">
        <div className="empty-state">
          <p className="empty-state-title">No profile record found</p>
          <p className="empty-state-text">Please consult your local ASHA worker to verify your registration.</p>
        </div>
      </div>
    );
  }

  const tickets = patient.tickets || [];
  const followups = patient.followups || [];
  const dueFollowups = followups.filter(f => f.status === 'due-today' || f.status === 'overdue');
  const activeMedicines = patient.medications ? patient.medications.filter(m => m.status === 'CURRENT') : [];

  const quickActions = [
    { label: 'Voice Assistant', desc: 'Speak your health question', icon: Mic, href: '/patient/voice' },
    { label: 'Health Information', desc: 'Public health advice & care', icon: BookOpen, href: '/patient/health-info' },
    { label: 'My Health Ticket', desc: 'Track your health tickets', icon: FileText, href: '/patient/ticket' },
    { label: 'Follow-ups', desc: 'Your scheduled appointments', icon: CalendarCheck, href: '/patient/followups' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {patient.name}</h1>
        <p className="page-subtitle">Your personal health portal &bull; Patient ID: {patient.id}</p>
      </div>

      {dueFollowups.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-lg)' }}>
          <CalendarCheck size={18} />
          <span>You have {dueFollowups.length} follow-up visit(s) scheduled that require attention.</span>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-lg)' }}
              onClick={() => router.push(action.href)}
            >
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)' }}>
                <Icon size={24} />
              </div>
              <div className="font-semibold">{action.label}</div>
              <div className="text-xs text-muted" style={{ marginTop: 4 }}>{action.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Active Medicines Section */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--color-primary)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <Pill size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 className="card-title" style={{ marginBottom: 0 }}>My Active Medicines (Doctor-Approved)</h3>
          </div>
          <span className="badge badge-success">{activeMedicines.length} Prescribed</span>
        </div>

        {activeMedicines.length === 0 ? (
          <p className="text-sm text-muted">No active medications currently prescribed.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>How to Take</th>
                  <th>Duration</th>
                  <th>Prescribing Doctor</th>
                </tr>
              </thead>
              <tbody>
                {activeMedicines.map((m, i) => (
                  <tr key={i}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.dosage}</td>
                    <td>{m.frequency}</td>
                    <td>{m.duration}</td>
                    <td>{m.doctor || 'PHC Medical Officer'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>My Registered Details</h3>
          <div className="info-grid">
            <span className="info-label">Full Name</span><span className="info-value">{patient.name}</span>
            <span className="info-label">Patient ID</span><span className="info-value">{patient.id}</span>
            <span className="info-label">Age / Gender</span><span className="info-value">{patient.age} years / {patient.gender}</span>
            <span className="info-label">Blood Group</span><span className="info-value">{patient.bloodGroup}</span>
            <span className="info-label">Village</span><span className="info-value">{patient.village}</span>
            <span className="info-label">Registered Date</span><span className="info-value">{patient.registeredDate}</span>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Recent Health Activity</h3>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted">No recent health tickets.</p>
          ) : (
            <div className="action-list">
              {tickets.slice(0, 3).map(t => (
                <div key={t.id} className="action-item" onClick={() => router.push('/patient/ticket')}>
                  <div className={`action-item-dot ${t.priority === 'high' ? 'urgent' : 'normal'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{t.id}</div>
                    <div className="text-xs text-muted">{t.concern}</div>
                  </div>
                  <span className="badge badge-neutral">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
