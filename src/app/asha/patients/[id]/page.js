'use client';

import { useParams, useRouter } from 'next/navigation';
import { getPatientById, getTicketsByPatient, getReferralsByPatient, getFollowupsByPatient } from '@/lib/demo-data';
import { ArrowLeft, FileText, Heart, CalendarCheck, ArrowRightLeft, AlertTriangle, Pill, ClipboardList } from 'lucide-react';
import { useState } from 'react';

export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patient = getPatientById(params.id);
  const [activeTab, setActiveTab] = useState('overview');

  if (!patient) {
    return (
      <div>
        <button className="btn btn-secondary mb-md" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">Patient not found</p>
            <p className="empty-state-text">The patient record could not be located.</p>
          </div>
        </div>
      </div>
    );
  }

  const tickets = getTicketsByPatient(patient.id);
  const referrals = getReferralsByPatient(patient.id);
  const followups = getFollowupsByPatient(patient.id);
  const latestVitals = patient.vitals[0];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'vitals', label: 'Vitals' },
    { key: 'visits', label: 'Visits' },
    { key: 'prescriptions', label: 'Prescriptions' },
    { key: 'reports', label: 'Reports' },
    { key: 'tickets', label: 'Health Tickets' },
  ];

  return (
    <div>
      <button className="btn btn-secondary mb-md" onClick={() => router.back()}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Patient Header */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div className="patient-avatar" style={{ width: 56, height: 56, fontSize: 'var(--font-size-lg)' }}>
            {patient.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{patient.name}</h1>
            <p className="text-sm text-secondary">
              {patient.id} &middot; {patient.age}y {patient.gender} &middot; {patient.village} &middot; Blood Group: {patient.bloodGroup}
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {patient.conditions.map((c, i) => (
                <span key={i} className={`badge ${c.includes('Diabetes') || c.includes('Hypertension') ? 'badge-warning' : c.includes('Pregnancy') || c.includes('Pregnant') ? 'badge-info' : 'badge-neutral'}`}>{c}</span>
              ))}
              {patient.isPregnant && <span className="badge badge-info">Week {patient.pregnancyWeek}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/asha/tickets')}>
              <FileText size={14} /> View Tickets
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/asha/referrals')}>
              <ArrowRightLeft size={14} /> Referrals
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Patient Information</h3>
            <div className="info-grid">
              <span className="info-label">Full Name</span><span className="info-value">{patient.name}</span>
              <span className="info-label">Patient ID</span><span className="info-value">{patient.id}</span>
              <span className="info-label">Age / Gender</span><span className="info-value">{patient.age} years / {patient.gender}</span>
              <span className="info-label">Village</span><span className="info-value">{patient.village}</span>
              <span className="info-label">Phone</span><span className="info-value">{patient.phone}</span>
              <span className="info-label">Blood Group</span><span className="info-value">{patient.bloodGroup}</span>
              <span className="info-label">Registered</span><span className="info-value">{patient.registeredDate}</span>
              <span className="info-label">Last Visit</span><span className="info-value">{patient.lastVisit}</span>
              <span className="info-label">Allergies</span><span className="info-value">{patient.allergies.join(', ')}</span>
            </div>
          </div>

          <div>
            {/* Latest Vitals */}
            {latestVitals ? (
              <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
                <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Latest Vitals ({latestVitals.date})</h3>
                <div className="info-grid">
                  <span className="info-label">Blood Pressure</span><span className="info-value">{latestVitals.bp}</span>
                  <span className="info-label">Pulse</span><span className="info-value">{latestVitals.pulse} bpm</span>
                  <span className="info-label">Temperature</span><span className="info-value">{latestVitals.temp} F</span>
                  <span className="info-label">Weight</span><span className="info-value">{latestVitals.weight} kg</span>
                  <span className="info-label">SpO2</span><span className="info-value">{latestVitals.spo2}%</span>
                  {latestVitals.hemoglobin && <><span className="info-label">Hemoglobin</span><span className="info-value">{latestVitals.hemoglobin} g/dL</span></>}
                  {latestVitals.sugar && <><span className="info-label">Blood Sugar</span><span className="info-value">{latestVitals.sugar} mg/dL</span></>}
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
                <h3 className="card-title">Latest Vitals</h3>
                <p className="text-sm text-muted" style={{ marginTop: 'var(--space-sm)' }}>No previous record available.</p>
              </div>
            )}

            {/* Pregnancy Info */}
            {patient.isPregnant && (
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Pregnancy Information</h3>
                <div className="info-grid">
                  <span className="info-label">Status</span><span className="info-value"><span className="badge badge-info">Active</span></span>
                  <span className="info-label">Current Week</span><span className="info-value">Week {patient.pregnancyWeek}</span>
                  <span className="info-label">Expected Delivery</span><span className="info-value">{patient.edd}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'vitals' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Vitals History</h3>
          {patient.vitals.length === 0 ? (
            <p className="text-sm text-muted">No previous record available.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>BP</th><th>Pulse</th><th>Temp</th><th>Weight</th><th>SpO2</th>
                    {patient.vitals.some(v => v.hemoglobin) && <th>Hb</th>}
                    {patient.vitals.some(v => v.sugar) && <th>Sugar</th>}
                  </tr>
                </thead>
                <tbody>
                  {patient.vitals.map((v, i) => (
                    <tr key={i}>
                      <td>{v.date}</td><td>{v.bp}</td><td>{v.pulse}</td><td>{v.temp}F</td><td>{v.weight}kg</td><td>{v.spo2}%</td>
                      {patient.vitals.some(vt => vt.hemoglobin) && <td>{v.hemoglobin || '-'}</td>}
                      {patient.vitals.some(vt => vt.sugar) && <td>{v.sugar || '-'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Visit History</h3>
          {patient.visits.length === 0 ? (
            <p className="text-sm text-muted">No previous record available.</p>
          ) : (
            <div className="timeline">
              {patient.visits.map((visit, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot completed" />
                  <div className="timeline-title">{visit.type}</div>
                  <div className="timeline-time">{visit.date} - {visit.by}</div>
                  <div className="timeline-desc">{visit.notes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Prescriptions</h3>
          {patient.prescriptions.length === 0 ? (
            <p className="text-sm text-muted">No previous prescriptions available.</p>
          ) : (
            patient.prescriptions.map((rx, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)', borderBottom: i < patient.prescriptions.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div className="flex items-center justify-between mb-md">
                  <span className="font-semibold text-sm">{rx.date}</span>
                  <span className="text-xs text-muted">By {rx.doctor}</span>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
                    </thead>
                    <tbody>
                      {rx.medicines.map((med, j) => (
                        <tr key={j}>
                          <td><strong>{med.name}</strong></td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Reports</h3>
          {patient.reports.length === 0 ? (
            <p className="text-sm text-muted">No reports uploaded.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Result</th><th>Facility</th></tr></thead>
                <tbody>
                  {patient.reports.map((r, i) => (
                    <tr key={i}><td>{r.date}</td><td>{r.type}</td><td>{r.result}</td><td>{r.facility}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Health Tickets</h3>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted">No health tickets found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {tickets.map(t => (
                <div key={t.id} className="action-item" onClick={() => router.push(`/asha/tickets/${t.id}`)}>
                  <div className={`action-item-dot ${t.priority === 'high' ? 'urgent' : 'normal'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{t.id}</div>
                    <div className="text-xs text-muted">{t.concern}</div>
                  </div>
                  <span className={`badge ${t.priority === 'high' ? 'badge-danger' : 'badge-primary'}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
