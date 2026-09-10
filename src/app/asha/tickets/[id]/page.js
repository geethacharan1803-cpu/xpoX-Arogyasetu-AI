'use client';

import { useParams, useRouter } from 'next/navigation';
import { getTicketById, getPatientById } from '@/lib/demo-data';
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react';

export default function TicketDetail() {
  const params = useParams();
  const router = useRouter();
  const ticket = getTicketById(params.id);

  if (!ticket) {
    return (
      <div>
        <button className="btn btn-secondary mb-md" onClick={() => router.back()}><ArrowLeft size={16} /> Back</button>
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">Health ticket not found</p>
            <p className="empty-state-text">The ticket ID could not be located.</p>
          </div>
        </div>
      </div>
    );
  }

  const patient = getPatientById(ticket.patientId);

  return (
    <div>
      <button className="btn btn-secondary mb-md" onClick={() => router.back()}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Ticket Header */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary-700)' }}>{ticket.id}</h1>
              <span className={`badge ${ticket.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ticket.priority} priority</span>
            </div>
            <p className="font-semibold">{ticket.concern}</p>
            <p className="text-sm text-muted">Patient: {ticket.patientName} ({ticket.patientId})</p>
          </div>
          {patient && (
            <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/asha/patients/${patient.id}`)}>
              View Patient Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Timeline */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>Ticket Timeline</h3>
          <div className="timeline">
            {ticket.timeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className={`timeline-dot ${item.completed ? 'completed' : 'pending'}`} />
                <div className="timeline-title">{item.step}</div>
                <div className="timeline-time">
                  {item.date || 'Pending'}
                  {item.completed && <span style={{ marginLeft: 8 }}><CheckCircle size={12} style={{ color: 'var(--color-success)', verticalAlign: 'middle' }} /></span>}
                </div>
                {item.note && <div className="timeline-desc">{item.note}</div>}
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Symptoms & Transcript */}
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Symptoms</h3>
            <p className="text-sm">{ticket.symptoms}</p>

            {ticket.transcript && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <div className="info-section-title">Original Transcript ({ticket.detectedLanguage})</div>
                <p className="text-sm" style={{ fontStyle: 'italic', padding: 'var(--space-sm)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  &ldquo;{ticket.transcript}&rdquo;
                </p>
              </div>
            )}

            {ticket.translatedTranscript && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <div className="info-section-title">English Translation</div>
                <p className="text-sm" style={{ padding: 'var(--space-sm)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  &ldquo;{ticket.translatedTranscript}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Vitals */}
          {ticket.vitals && (
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Vitals at Registration</h3>
              <div className="info-grid">
                <span className="info-label">Blood Pressure</span><span className="info-value">{ticket.vitals.bp}</span>
                <span className="info-label">Pulse</span><span className="info-value">{ticket.vitals.pulse} bpm</span>
                <span className="info-label">Temperature</span><span className="info-value">{ticket.vitals.temp} F</span>
                <span className="info-label">Weight</span><span className="info-value">{ticket.vitals.weight} kg</span>
                <span className="info-label">SpO2</span><span className="info-value">{ticket.vitals.spo2}%</span>
                {ticket.vitals.sugar && <><span className="info-label">Blood Sugar</span><span className="info-value">{ticket.vitals.sugar} mg/dL</span></>}
              </div>
            </div>
          )}

          {/* Patient History Summary */}
          {patient && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Patient History Summary</h3>
              <div className="info-grid">
                <span className="info-label">Age / Gender</span><span className="info-value">{patient.age}y {patient.gender}</span>
                <span className="info-label">Conditions</span><span className="info-value">{patient.conditions.join(', ')}</span>
                <span className="info-label">Allergies</span><span className="info-value">{patient.allergies.join(', ')}</span>
                <span className="info-label">Previous Visits</span><span className="info-value">{patient.visits.length} recorded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
