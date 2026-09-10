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

          {/* Prescriptions & Instructions */}
          {patient && patient.prescriptions && patient.prescriptions.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <h3 className="card-title" style={{ marginBottom: 0 }}>Doctor Prescriptions</h3>
                <span className="badge badge-success">Verified</span>
              </div>
              {patient.prescriptions.map((rx, i) => (
                <div key={i} style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Prescribed by {rx.doctor} on {rx.date}</div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
                      </thead>
                      <tbody>
                        {rx.medicines.map((m, j) => (
                          <tr key={j}>
                            <td><strong>{m.name}</strong></td>
                            <td>{m.dosage}</td>
                            <td>{m.frequency}</td>
                            <td>{m.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Care Continuity Actions</h3>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/asha/referrals')}>
                Create PHC Referral
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/asha/followups')}>
                Schedule Follow-up
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push('/asha/voice')}>
                Voice Re-evaluation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
