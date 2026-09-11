'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, FileText, Heart, CalendarCheck, ArrowRightLeft,
  AlertTriangle, Pill, ClipboardList, Clock, Activity, Plus,
  Mic, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Quick vital recording modal
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [vitalForm, setVitalForm] = useState({ bp: '', pulse: '', temp: '', spo2: '', sugar: '' });
  const [vitalSubmitting, setVitalSubmitting] = useState(false);

  const loadPatientData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, historyRes] = await Promise.all([
        fetch(`/api/patients/${params.id}`),
        fetch(`/api/patients/${params.id}/history`)
      ]);

      if (!profileRes.ok) {
        throw new Error('Patient record could not be found');
      }

      const profileData = await profileRes.json();
      setPatient(profileData.patient);

      if (historyRes.ok) {
        const histData = await historyRes.json();
        setHistory(histData.history || []);
      }
    } catch (err) {
      console.error('Error loading patient:', err);
      setError(err.message || 'Failed to load patient profile from database');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const handleAddVitals = async (e) => {
    e.preventDefault();
    setVitalSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${params.id}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vitalForm,
          recordedBy: user?.name || 'ASHA Worker',
        }),
      });

      if (res.ok) {
        setShowVitalModal(false);
        setVitalForm({ bp: '', pulse: '', temp: '', spo2: '', sugar: '' });
        await loadPatientData();
      } else {
        alert('Failed to record vitals. Please check connection and try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error recording vitals.');
    } finally {
      setVitalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading patient clinical profile from database...</span>
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
            <p className="empty-state-text">{error || 'The patient record could not be located in the database.'}</p>
            <button className="btn btn-primary" onClick={() => router.push('/asha/patients')} style={{ marginTop: 'var(--space-md)' }}>
              Return to Patient Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const latestVitals = patient.vitals && patient.vitals.length > 0 ? patient.vitals[0] : null;
  const currentMedicines = patient.medications ? patient.medications.filter(m => m.status === 'CURRENT') : [];
  const previousMedicines = patient.medications ? patient.medications.filter(m => m.status !== 'CURRENT') : [];
  const activeReferral = patient.referrals ? patient.referrals.find(r => r.status !== 'completed') : null;
  const nextFollowup = patient.followups ? patient.followups.find(f => f.status !== 'completed') : null;

  const tabs = [
    { key: 'overview', label: 'Overview & Medicines' },
    { key: 'timeline', label: `Chronological History (${history.length})` },
    { key: 'vitals', label: `Vitals (${patient.vitals?.length || 0})` },
    { key: 'visits', label: `Hospital Visits (${patient.visits?.length || 0})` },
    { key: 'prescriptions', label: `Prescriptions (${patient.prescriptions?.length || 0})` },
    { key: 'tickets', label: `Health Tickets (${patient.tickets?.length || 0})` },
    { key: 'voice', label: `Voice Records (${patient.voiceRecords?.length || 0})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowVitalModal(true)}>
            <Activity size={14} /> Record New Vitals
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/asha/tickets')}>
            <Plus size={14} /> New Ticket
          </button>
        </div>
      </div>

      {/* Patient Header */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div className="patient-avatar" style={{ width: 56, height: 56, fontSize: 'var(--font-size-lg)' }}>
            {patient.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>{patient.name}</h1>
              <span className="badge badge-primary">{patient.id}</span>
              {patient.isPregnant && <span className="badge badge-info">Pregnant W{patient.pregnancyWeek}</span>}
            </div>
            <p className="text-sm text-secondary" style={{ marginTop: 4 }}>
              {patient.age}y &bull; {patient.gender} &bull; Village: <strong>{patient.village}</strong> &bull; Blood Group: <strong>{patient.bloodGroup}</strong> &bull; Phone: {patient.phone}
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {patient.conditions && patient.conditions.map((c, i) => (
                <span key={i} className={`badge ${c.includes('Diabetes') || c.includes('Hypertension') ? 'badge-warning' : c.includes('Pregnancy') ? 'badge-info' : 'badge-neutral'}`}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Bar */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="stat-card">
          <div className="stat-card-icon primary"><Pill size={18} /></div>
          <div className="stat-card-value">{currentMedicines.length}</div>
          <div className="stat-card-label">Active Medicines</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon info"><Activity size={18} /></div>
          <div className="stat-card-value">{latestVitals ? latestVitals.bp : 'N/A'}</div>
          <div className="stat-card-label">Latest Blood Pressure</div>
        </div>
        <div className="stat-card">
          <div className={`stat-card-icon ${activeReferral ? 'warning' : 'success'}`}><ArrowRightLeft size={18} /></div>
          <div className="stat-card-value">{activeReferral ? 'Active' : 'None'}</div>
          <div className="stat-card-label">{activeReferral ? activeReferral.destination : 'Referrals'}</div>
        </div>
        <div className="stat-card">
          <div className={`stat-card-icon ${nextFollowup ? 'primary' : 'success'}`}><CalendarCheck size={18} /></div>
          <div className="stat-card-value">{nextFollowup ? nextFollowup.dueDate : 'None'}</div>
          <div className="stat-card-label">Next Follow-up</div>
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

      {/* OVERVIEW & MEDICINE-FIRST TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Priority 1: Current Medicines */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <Pill size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 className="card-title" style={{ marginBottom: 0 }}>Current Medicines (Clinician-Authorized)</h3>
              </div>
              <span className="badge badge-success">{currentMedicines.length} Active</span>
            </div>
            {currentMedicines.length === 0 ? (
              <p className="text-sm text-muted">No active medications currently prescribed.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dose</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Prescribed By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMedicines.map((m, i) => (
                      <tr key={i}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.dosage}</td>
                        <td>{m.frequency}</td>
                        <td>{m.duration}</td>
                        <td>{m.doctor || 'PHC Medical Officer'}</td>
                        <td><span className="badge badge-success">CURRENT</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid-2">
            {/* Latest Vitals */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Latest Vital Signs</h3>
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
                  {latestVitals.hemoglobin && <><span className="info-label">Hemoglobin</span><span className="info-value">{latestVitals.hemoglobin} g/dL</span></>}
                </div>
              ) : (
                <p className="text-sm text-muted">No previous record available.</p>
              )}
            </div>

            {/* Demographics & Clinical Notes */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Demographics &amp; Contact</h3>
              <div className="info-grid">
                <span className="info-label">Patient ID</span><span className="info-value">{patient.id}</span>
                <span className="info-label">Village / Locality</span><span className="info-value">{patient.village}</span>
                <span className="info-label">Phone</span><span className="info-value">{patient.phone}</span>
                <span className="info-label">Registered Date</span><span className="info-value">{patient.registeredDate}</span>
                <span className="info-label">Allergies</span><span className="info-value">{patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None known'}</span>
                {patient.isPregnant && (
                  <>
                    <span className="info-label">ANC Week</span><span className="info-value font-bold text-info">Week {patient.pregnancyWeek}</span>
                    <span className="info-label">EDD</span><span className="info-value">{patient.edd || 'In 6 months'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Previous / Completed Medicines */}
          {previousMedicines.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Previous / Completed Medicines</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dose</th>
                      <th>Prescribed By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousMedicines.map((m, i) => (
                      <tr key={i}>
                        <td>{m.name}</td>
                        <td>{m.dosage}</td>
                        <td>{m.doctor}</td>
                        <td><span className="badge badge-neutral">{m.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHRONOLOGICAL HISTORY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Chronological Clinical History</h3>
            <span className="badge badge-primary">{history.length} database records</span>
          </div>
          {history.length === 0 ? (
            <div className="empty-state">
              <Clock size={28} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-sm)' }} />
              <p className="empty-state-text">No previous records available.</p>
            </div>
          ) : (
            <div className="timeline">
              {history.map((evt) => (
                <div key={evt.id} className="timeline-item">
                  <div className={`timeline-dot completed`} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div className="timeline-title">{evt.title}</div>
                    <span className={`badge ${evt.badge || 'badge-neutral'}`}>{evt.type}</span>
                  </div>
                  <div className="timeline-time">{evt.date} &bull; Recorded by {evt.performedBy}</div>
                  <div className="timeline-desc" style={{ marginTop: 'var(--space-xs)' }}>{evt.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VITALS HISTORY TAB */}
      {activeTab === 'vitals' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Vitals History</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowVitalModal(true)}>
              <Plus size={14} /> Add Vitals
            </button>
          </div>
          {!patient.vitals || patient.vitals.length === 0 ? (
            <p className="text-sm text-muted">No previous record available.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Blood Pressure</th>
                    <th>Pulse</th>
                    <th>Temp</th>
                    <th>SpO2</th>
                    <th>Weight</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.vitals.map((v, i) => (
                    <tr key={i}>
                      <td>{v.date}</td>
                      <td><strong>{v.bp}</strong></td>
                      <td>{v.pulse} bpm</td>
                      <td>{v.temp} °F</td>
                      <td>{v.spo2}%</td>
                      <td>{v.weight} kg</td>
                      <td>{v.recordedBy || 'ASHA Worker'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HOSPITAL VISITS TAB */}
      {activeTab === 'visits' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Hospital &amp; Field Visits</h3>
          {!patient.visits || patient.visits.length === 0 ? (
            <p className="text-sm text-muted">No previous record available.</p>
          ) : (
            <div className="timeline">
              {patient.visits.map((visit, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot completed" />
                  <div className="timeline-title">{visit.type} &mdash; {visit.facility || 'Health Facility'}</div>
                  <div className="timeline-time">{visit.date} &bull; Attended by {visit.doctor || visit.by}</div>
                  <div className="timeline-desc">{visit.notes || visit.reason}</div>
                  {visit.assessment && (
                    <div style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--color-primary)' }}>
                      Assessment: {visit.assessment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Prescriptions &amp; Clinical Directives</h3>
          {!patient.prescriptions || patient.prescriptions.length === 0 ? (
            <p className="text-sm text-muted">No previous prescriptions available.</p>
          ) : (
            patient.prescriptions.map((rx, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <div>
                    <span className="font-semibold">{rx.id || `Prescription #${i + 1}`}</span>
                    <span className="text-xs text-muted" style={{ marginLeft: 8 }}>{rx.date}</span>
                  </div>
                  <span className="badge badge-success">By {rx.doctor}</span>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
                    </thead>
                    <tbody>
                      {rx.medicines && rx.medicines.map((m, j) => (
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
                {rx.notes && (
                  <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
                    <strong>Doctor Instructions:</strong> {rx.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Health Tickets</h3>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/asha/tickets')}>
              <Plus size={14} /> New Ticket
            </button>
          </div>
          {!patient.tickets || patient.tickets.length === 0 ? (
            <p className="text-sm text-muted">No health tickets found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {patient.tickets.map(t => (
                <div key={t.id} className="action-item" onClick={() => router.push(`/asha/tickets`)}>
                  <div className={`action-item-dot ${t.priority === 'high' ? 'urgent' : 'normal'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{t.id} &mdash; {t.concern}</div>
                    <div className="text-xs text-muted">Status: {t.status} &bull; Created: {t.createdDate}</div>
                  </div>
                  <span className={`badge ${t.priority === 'high' ? 'badge-danger' : 'badge-primary'}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VOICE RECORDS TAB */}
      {activeTab === 'voice' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Vernacular Voice Records (ArogyaVani)</h3>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/asha/voice')}>
              <Mic size={14} /> Record Voice
            </button>
          </div>
          {!patient.voiceRecords || patient.voiceRecords.length === 0 ? (
            <p className="text-sm text-muted">No previous voice interactions recorded for this patient.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {patient.voiceRecords.map(vr => (
                <div key={vr.id} style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="badge badge-info">{vr.detectedLanguage || 'Vernacular'}</span>
                    <span className="text-xs text-muted">{vr.date}</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ fontStyle: 'italic', marginBottom: 4 }}>
                    &ldquo;{vr.transcript}&rdquo;
                  </p>
                  {vr.translatedText && (
                    <p className="text-xs text-secondary">
                      <strong>English Translation:</strong> {vr.translatedText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record Vitals Modal */}
      {showVitalModal && (
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
          <div className="card" style={{ maxWidth: 440, width: '100%' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Record New Vital Signs</h3>
            <form onSubmit={handleAddVitals}>
              <div className="form-group">
                <label className="form-label">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 120/80"
                  value={vitalForm.bp}
                  onChange={e => setVitalForm({ ...vitalForm, bp: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                <div className="form-group">
                  <label className="form-label">Pulse (bpm)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="76"
                    value={vitalForm.pulse}
                    onChange={e => setVitalForm({ ...vitalForm, pulse: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="98.6"
                    value={vitalForm.temp}
                    onChange={e => setVitalForm({ ...vitalForm, temp: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                <div className="form-group">
                  <label className="form-label">SpO2 (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="98"
                    value={vitalForm.spo2}
                    onChange={e => setVitalForm({ ...vitalForm, spo2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="110"
                    value={vitalForm.sugar}
                    onChange={e => setVitalForm({ ...vitalForm, sugar: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVitalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={vitalSubmitting}>
                  {vitalSubmitting ? 'Saving...' : 'Save to Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
