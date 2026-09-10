'use client';

import { useAuth } from '@/lib/auth-context';
import { DEMO_PATIENTS, DEMO_HEALTH_TICKETS, DEMO_FOLLOWUPS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { Mic, BookOpen, FileText, CalendarCheck, Heart } from 'lucide-react';

export default function PatientHome() {
  const { user } = useAuth();
  const router = useRouter();

  const patient = DEMO_PATIENTS.find(p => p.id === user?.patientId) || DEMO_PATIENTS[0];
  const tickets = DEMO_HEALTH_TICKETS.filter(t => t.patientId === patient.id);
  const followups = DEMO_FOLLOWUPS.filter(f => f.patientId === patient.id);
  const dueFollowups = followups.filter(f => f.status === 'due-today' || f.status === 'overdue');

  const quickActions = [
    { label: 'Voice Assistant', desc: 'Describe your symptoms by speaking', icon: Mic, href: '/patient/voice' },
    { label: 'Health Information', desc: 'Learn about health topics', icon: BookOpen, href: '/patient/health-info' },
    { label: 'My Health Ticket', desc: 'View your health tickets', icon: FileText, href: '/patient/ticket' },
    { label: 'Follow-ups', desc: 'View upcoming appointments', icon: CalendarCheck, href: '/patient/followups' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {patient.name}</h1>
        <p className="page-subtitle">Your health information and services</p>
      </div>

      {dueFollowups.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--space-lg)' }}>
          <CalendarCheck size={18} />
          <span>You have {dueFollowups.length} follow-up visit(s) that need attention.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <div key={action.label} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: 'var(--space-xl) var(--space-lg)' }} onClick={() => router.push(action.href)}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-100)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)' }}>
                <Icon size={24} />
              </div>
              <div className="font-semibold">{action.label}</div>
              <div className="text-sm text-muted" style={{ marginTop: 4 }}>{action.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>My Information</h3>
          <div className="info-grid">
            <span className="info-label">Name</span><span className="info-value">{patient.name}</span>
            <span className="info-label">ID</span><span className="info-value">{patient.id}</span>
            <span className="info-label">Age</span><span className="info-value">{patient.age} years</span>
            <span className="info-label">Blood Group</span><span className="info-value">{patient.bloodGroup}</span>
            <span className="info-label">Village</span><span className="info-value">{patient.village}</span>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Recent Activity</h3>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
