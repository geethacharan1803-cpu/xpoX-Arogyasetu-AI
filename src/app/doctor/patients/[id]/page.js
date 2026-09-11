'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Pill, Activity, CalendarCheck, ArrowRightLeft,
  FileText, Clock, AlertTriangle, Plus, CheckCircle, Stethoscope,
  Volume2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DoctorPatientDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Inline Clinical Assessment / Note modal
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);

  // Inline Quick Prescription modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days' }
  ]);
  const [rxNotes, setRxNotes] = useState('Take after meals with water.');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  const loadPatientData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, hRes] = await Promise.all([
        fetch(`/api/patients/${params.id}`),
        fetch(`/api/patients/${params.id}/history`)
      ]);

      if (!pRes.ok) throw new Error('Patient record not found');

      const pData = await pRes.json();
      setPatient(pData.patient);

      if (hRes.ok) {
        const hData = await hRes.json();
        setHistory(hData.history || []);
      }
    } catch (err) {
      console.error('Error loading doctor patient profile:', err);
      setError('Unable to load patient data from database');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentNotes.trim()) return;

    setIsSubmittingAssessment(true);
    try {
      const res = await fetch(`/api/patients/${params.id}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName: user?.phc || 'PHC Rampur',
          visitType: 'PHC Doctor Review',
          doctor: user?.name || 'Dr. Sharma',
          assessment: assessmentNotes.trim(),
          notes: assessmentNotes.trim(),
        }),
      });

      if (res.ok) {
        setShowAssessmentModal(false);
        setAssessmentNotes('');
        await loadPatientData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save assessment');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    const validMeds = medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) return;

    setIsSubmittingRx(true);
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: user?.id || 'U-002',
          doctorName: user?.name || 'Dr. Sharma',
          medicines: validMeds,
          notes: rxNotes,
        }),
      });

      if (res.ok) {
        setShowRxModal(false);
        setMedicines([{ name: '', dosage: '', frequency: 'Twice daily', duration: '5 days' }]);
        setRxNotes('Take after meals with water.');
        await loadPatientData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to authorize prescription');
    } finally {
      setIsSubmittingRx(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading clinical dossier...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div>
        <button className="btn btn-secondary mb-md" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="card">
          <div className="empty-state">
            <AlertTriangle size={32} style={{ color: 'var(--color-danger)', margin: '0 auto var(--space-md)' }} />
            <p className="empty-state-title">Patient not found</p>
            <p className="empty-state-text">The patient record could not be retrieved from the database.</p>
          </div>
        </div>
      </div>
    );
  }

  const latestVitals = patient.vitals && patient.vitals.length > 0 ? patient.vitals[0] : null;
  const currentMedicines = patient.medications ? patient.medications.filter(m => m.status === 'CURRENT') : [];
  const previousMedicines = patient.medications ? patient.medications.filter(m => m.status !== 'CURRENT') : [];

  const tabs = [
    { key: 'overview', label: 'Clinical Overview' },
    { key: 'medicines', label: `Medicines (${currentMedicines.length} Active)` },
    { key: 'history', label: `Chronological History (${history.length})` },
    { key: 'vitals', label: `Vitals (${patient.vitals?.length || 0})` },
    { key: 'visits', label: `Visits (${patient.visits?.length || 0})` },
    { key: 'voice', label: `Voice & Intake (${patient.voiceRecords?.length || 0})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        <button className="btn btn-secondary" onClick={() => router.push('/doctor/patients')}>
          <ArrowLeft size={16} /> Patient Directory
        </button>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAssessmentModal(true)}>
            <Stethoscope size={14} /> Record Clinical Assessment
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowRxModal(true)}>
            <Pill size={14} /> Authorize Prescription
          </button>
        </div>
      </div>

      {/* Patient Clinical Header */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div className="patient-avatar" style={{ width: 56, height: 56, fontSize: 'var(--font-size-lg)' }}>
            {patient.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>{patient.name}</h1>
              <span className="badge badge-primary">{patient.id}</span>
              {patient.isPregnant && <span className="badge badge-info">Pregnant Week {patient.pregnancyWeek}</span>}
            </div>
            <p className="text-sm text-secondary" style={{ marginTop: 4 }}>
              {patient.age}y &bull; {patient.gender} &bull; Village: <strong>{patient.village}</strong> &bull; Blood Group: <strong>{patient.bloodGroup}</strong> &bull; Phone: {patient.phone}
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {patient.conditions && patient.conditions.map((c, i) => (
                <span key={i} className={`badge ${c.includes('Diabetes') || c.includes('Hypertension') ? 'badge-warning' : 'badge-neutral'}`}>{c}</span>
              ))}
            </div>
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

      {/* CLINICAL OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="grid-2">
            {/* Latest Vitals */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Latest Recorded Vitals</h3>
                {latestVitals && <span className="text-xs text-muted">{latestVitals.date}</span>}
              </div>
              {latestVitals ? (
                <div className="info-grid">
                  <span className="info-label">Blood Pressure</span><span className="info-value font-bold">{latestVitals.bp}</span>
                  <span className="info-label">Pulse</span><span className="info-value">{latestVitals.pulse} bpm</span>
                  <span className="info-label">Temperature</span><span className="info-value">{latestVitals.temp} °F</span>
                  <span className="info-label">SpO2</span><span className="info-value">{latestVitals.spo2}%</span>
                  <span className="info-label">Weight</span><span className="info-value">{latestVitals.weight} kg</span>
                  {latestVitals.sugar && <><span className="info-label">Blood Sugar</span><span className="info-value">{latestVitals.sugar} mg/dL</span></>}
                </div>
              ) : (
                <p className="text-sm text-muted">No previous vitals recorded.</p>
              )}
            </div>

            {/* Current Medicines Quick Box */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Active Medications</h3>
                <span className="badge badge-success">{currentMedicines.length} Active</span>
              </div>
              {currentMedicines.length === 0 ? (
                <p className="text-sm text-muted">No active medications.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  {currentMedicines.map((m, i) => (
                    <div key={i} style={{ padding: 'var(--space-xs) 0', borderBottom: i < currentMedicines.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div className="font-semibold text-sm">{m.name} ({m.dosage})</div>
                      <div className="text-xs text-muted">{m.frequency} &bull; {m.duration} &bull; Prescribed by {m.doctor}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Referrals & Tickets */}
          <div className="grid-2">
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Referrals to this PHC</h3>
              {!patient.referrals || patient.referrals.length === 0 ? (
                <p className="text-sm text-muted">No referrals on record.</p>
              ) : (
                patient.referrals.map(r => (
                  <div key={r.id} style={{ marginBottom: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-semibold text-sm">{r.id}</span>
                      <span className={`badge ${r.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{r.status.toUpperCase()}</span>
                    </div>
                    <p className="text-sm" style={{ marginTop: 4 }}>{r.reason}</p>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Associated Health Tickets</h3>
              {!patient.tickets || patient.tickets.length === 0 ? (
                <p className="text-sm text-muted">No health tickets on record.</p>
              ) : (
                patient.tickets.map(t => (
                  <div key={t.id} style={{ marginBottom: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-semibold text-sm">{t.id}</span>
                      <span className="badge badge-info">{t.status}</span>
                    </div>
                    <p className="text-sm" style={{ marginTop: 4 }}>{t.concern}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MEDICINES TAB */}
      {activeTab === 'medicines' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Medication History &amp; Regimen</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowRxModal(true)}>
              <Plus size={14} /> Prescribe Medicine
            </button>
          </div>
          {!patient.medications || patient.medications.length === 0 ? (
            <p className="text-sm text-muted">No previous prescriptions or medications on record.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dose</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Prescribing Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.medications.map((m, i) => (
                    <tr key={i}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                      <td>{m.doctor}</td>
                      <td>
                        <span className={`badge ${m.status === 'CURRENT' ? 'badge-success' : 'badge-neutral'}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHRONOLOGICAL HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Chronological Clinical History</h3>
            <span className="badge badge-primary">{history.length} database records</span>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted">No previous records available.</p>
          ) : (
            <div className="timeline">
              {history.map((evt) => (
                <div key={evt.id} className="timeline-item">
                  <div className="timeline-dot completed" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div className="timeline-title">{evt.title}</div>
                    <span className={`badge ${evt.badge || 'badge-neutral'}`}>{evt.type}</span>
                  </div>
                  <div className="timeline-time">{evt.date} &bull; By {evt.performedBy}</div>
                  <div className="timeline-desc" style={{ marginTop: 4 }}>{evt.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VITALS TAB */}
      {activeTab === 'vitals' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Vital Signs History</h3>
          {!patient.vitals || patient.vitals.length === 0 ? (
            <p className="text-sm text-muted">No previous record available.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Date</th><th>Blood Pressure</th><th>Pulse</th><th>Temp</th><th>SpO2</th><th>Weight</th><th>Recorded By</th></tr>
                </thead>
                <tbody>
                  {patient.vitals.map((v, i) => (
                    <tr key={i}>
                      <td>{v.date}</td><td><strong>{v.bp}</strong></td><td>{v.pulse} bpm</td><td>{v.temp} °F</td><td>{v.spo2}%</td><td>{v.weight} kg</td><td>{v.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VISITS TAB */}
      {activeTab === 'visits' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hospital &amp; Clinical Visits</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAssessmentModal(true)}>
              <Plus size={14} /> Add Assessment
            </button>
          </div>
          {!patient.visits || patient.visits.length === 0 ? (
            <p className="text-sm text-muted">No previous record available.</p>
          ) : (
            <div className="timeline">
              {patient.visits.map((v, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot completed" />
                  <div className="timeline-title">{v.type} &mdash; {v.facility || 'Health Facility'}</div>
                  <div className="timeline-time">{v.date} &bull; Attended by {v.doctor || v.by}</div>
                  <div className="timeline-desc">{v.notes || v.reason}</div>
                  {v.assessment && (
                    <div style={{ marginTop: 4, color: 'var(--color-primary)', fontWeight: 500 }}>
                      Clinical Assessment: {v.assessment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VOICE & INTAKE TAB */}
      {activeTab === 'voice' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Vernacular Voice Intake &amp; AI Summaries</h3>
          {!patient.voiceRecords || patient.voiceRecords.length === 0 ? (
            <p className="text-sm text-muted">No voice records available for this patient.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {patient.voiceRecords.map(vr => (
                <div key={vr.id} style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="badge badge-info">{vr.detectedLanguage || 'Vernacular'}</span>
                    <span className="text-xs text-muted">{vr.date}</span>
                  </div>
                  <p className="text-sm" style={{ fontStyle: 'italic', fontWeight: 600 }}>&ldquo;{vr.transcript}&rdquo;</p>
                  {vr.translatedText && (
                    <p className="text-xs text-secondary" style={{ marginTop: 4 }}>
                      <strong>Clinical English Translation:</strong> {vr.translatedText}
                    </p>
                  )}
                  {vr.aiSummary && (
                    <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                      <strong>ASHA Vernacular Guidance Spoken:</strong> {vr.aiSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Record Clinical Assessment */}
      {showAssessmentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-md)'
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Record Clinical Assessment</h3>
            <form onSubmit={handleSaveAssessment}>
              <div className="form-group">
                <label className="form-label">Doctor's Clinical Notes &amp; Plan</label>
                <textarea
                  className="form-input"
                  rows={4}
                  required
                  placeholder="Record diagnosis, diagnostic plan, clinical observations..."
                  value={assessmentNotes}
                  onChange={e => setAssessmentNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssessmentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingAssessment}>
                  {isSubmittingAssessment ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inline Quick Prescription */}
      {showRxModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-md)'
        }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Authorize Prescription</h3>
            <form onSubmit={handleSavePrescription}>
              {medicines.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                  <input
                    className="form-input"
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={e => {
                      const updated = [...medicines];
                      updated[idx].name = e.target.value;
                      setMedicines(updated);
                    }}
                    required
                  />
                  <input
                    className="form-input"
                    placeholder="Dose (e.g. 500mg)"
                    value={med.dosage}
                    onChange={e => {
                      const updated = [...medicines];
                      updated[idx].dosage = e.target.value;
                      setMedicines(updated);
                    }}
                  />
                  <input
                    className="form-input"
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={e => {
                      const updated = [...medicines];
                      updated[idx].frequency = e.target.value;
                      setMedicines(updated);
                    }}
                  />
                </div>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-secondary mb-md"
                onClick={() => setMedicines([...medicines, { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days' }])}
              >
                + Add Another Medicine
              </button>

              <div className="form-group">
                <label className="form-label">Doctor Notes / Verified Instructions</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={rxNotes}
                  onChange={e => setRxNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRxModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingRx}>
                  {isSubmittingRx ? 'Authorizing...' : 'Authorize & Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
