'use client';

import { useAuth } from '@/lib/auth-context';
import { DEMO_PATIENTS, DEMO_HEALTH_TICKETS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, Volume2 } from 'lucide-react';

export default function PatientTicket() {
  const { user } = useAuth();
  const router = useRouter();
  const patient = DEMO_PATIENTS.find(p => p.id === user?.patientId) || DEMO_PATIENTS[0];
  const tickets = DEMO_HEALTH_TICKETS.filter(t => t.patientId === patient.id);

  const speakProgress = (ticket) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const lastCompleted = [...ticket.timeline].reverse().find(t => t.completed);
      const text = `మీ హెల్త్ టిక్కెట్ ${ticket.id} ప్రస్తుత సమాచారం: ${ticket.concern}. ప్రస్తుత దశ: ${lastCompleted ? lastCompleted.step : 'ప్రారంభం'}. ${lastCompleted?.note || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'te-IN';
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Health Tickets</h1>
        <p className="page-subtitle">View your health ticket history</p>
      </div>

      {tickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <p className="empty-state-title">No health tickets</p>
            <p className="empty-state-text">You do not have any health tickets yet.</p>
          </div>
        </div>
      ) : (
        tickets.map(ticket => (
          <div key={ticket.id} className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-primary-700)' }}>{ticket.id}</h2>
                <span className={`badge ${ticket.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ticket.priority}</span>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => speakProgress(ticket)}>
                <Volume2 size={14} /> Listen (తెలుగు)
              </button>
            </div>
            <p className="font-semibold">{ticket.concern}</p>
            <p className="text-sm text-muted" style={{ marginTop: 4 }}>Created: {ticket.createdDate}</p>

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Progress</h3>
              <div className="timeline">
                {ticket.timeline.map((item, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${item.completed ? 'completed' : 'pending'}`} />
                    <div className="timeline-title">{item.step}</div>
                    <div className="timeline-time">{item.date || 'Pending'}</div>
                    {item.note && <div className="timeline-desc">{item.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
