'use client';

import { useState } from 'react';
import { DEMO_PATIENTS } from '@/lib/demo-data';
import { Pill, AlertTriangle, Volume2, Globe, CheckCircle } from 'lucide-react';

export default function DoctorPrescriptions() {
  const [selectedPatient, setSelectedPatient] = useState('P-2026-002');
  const [medicines, setMedicines] = useState([
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days' },
  ]);
  const [notes, setNotes] = useState('Monitor fasting sugar and record daily blood pressure with ASHA Priya.');
  const [saved, setSaved] = useState(false);
  const [verifiedExplainer, setVerifiedExplainer] = useState(null);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);

    const patient = DEMO_PATIENTS.find(p => p.id === selectedPatient) || DEMO_PATIENTS[0];
    const medList = medicines.filter(m => m.name.trim()).map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ');

    // Generate verified explainer that preserves exact medication and dose
    const explainer = {
      patientName: patient.name,
      patientId: patient.id,
      prescribedMedicines: medicines.filter(m => m.name.trim()),
      telugu: `రోగి ${patient.name} కొరకు వైద్యుల సూచనలు: ${medList}. మందులను ప్రతిరోజూ క్రమం తప్పకుండా భోజనం తర్వాత తగినంత నీటితో మాత్రమే వేసుకోవాలి. మోతాదు మార్చవద్దు.`,
      hindi: `मरीज ${patient.name} के लिए डॉक्टर की सलाह: ${medList}। दवाइयां नियमित रूप से भोजन के बाद पर्याप्त पानी के साथ लें। खुराक में कोई बदलाव न करें।`,
      english: `Verified Instructions for ${patient.name}: ${medList}. Take strictly as directed after meals. Do not alter dose or duration without consulting your PHC doctor.`,
      notes: notes,
      timestamp: new Date().toLocaleTimeString(),
    };

    setVerifiedExplainer(explainer);
  };

  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Prescriptions & Care Directives</h1>
        <p className="page-subtitle">Clinician-authorized prescriptions with verified patient vernacular instructions</p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: 'var(--space-md)' }}>
        <AlertTriangle size={18} />
        <span>
          <strong>AI Safety Protocol:</strong> AI is strictly prohibited from altering or creating prescriptions. Only certified Medical Officers prescribe medications. AI is only permitted to translate and explain approved clinician directives.
        </span>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>
          <CheckCircle size={18} />
          <span>Prescription authorized and locked into patient care continuity record.</span>
        </div>
      )}

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>New Prescription</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select className="form-select" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
              <option value="">Select patient...</option>
              {DEMO_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Medicines</label>
              <button type="button" className="btn btn-sm btn-secondary" onClick={addMedicine}>Add Medicine</button>
            </div>
            {medicines.map((med, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  {i === 0 && <label className="form-label">Name</label>}
                  <input className="form-input" placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  {i === 0 && <label className="form-label">Dosage</label>}
                  <input className="form-input" placeholder="e.g. 500mg" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  {i === 0 && <label className="form-label">Frequency</label>}
                  <input className="form-input" placeholder="e.g. Twice daily" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  {i === 0 && <label className="form-label">Duration</label>}
                  <input className="form-input" placeholder="e.g. 7 days" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} required />
                </div>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeMedicine(i)} style={{ marginBottom: i === 0 ? 0 : 0 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Notes</label>
            <textarea className="form-textarea" placeholder="Additional instructions or notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary"><Pill size={16} /> Authorize & Save Prescription</button>
            <button type="button" className="btn btn-secondary" onClick={() => setVerifiedExplainer(null)}>Reset</button>
          </div>
        </form>
      </div>

      {verifiedExplainer && (
        <div className="card" style={{ marginTop: 'var(--space-lg)', borderLeft: '4px solid var(--color-primary)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div>
              <h3 className="card-title">Verified Patient Explainer — &ldquo;Voice Back to Patient&rdquo;</h3>
              <p className="text-xs text-muted">Generated for {verifiedExplainer.patientName} ({verifiedExplainer.patientId}) at {verifiedExplainer.timestamp}</p>
            </div>
            <span className="badge badge-success">Audit Trail Preserved</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            {/* Telugu Explainer */}
            <div style={{ background: 'var(--color-bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                <span className="font-semibold text-sm">తెలుగు (Telugu Patient Instructions)</span>
                <button className="btn btn-sm btn-primary" onClick={() => speak(verifiedExplainer.telugu, 'te-IN')}>
                  <Volume2 size={14} /> Listen in Telugu
                </button>
              </div>
              <p className="text-sm font-medium" style={{ lineHeight: 1.6 }}>{verifiedExplainer.telugu}</p>
            </div>

            {/* Hindi Explainer */}
            <div style={{ background: 'var(--color-bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                <span className="font-semibold text-sm">हिन्दी (Hindi Patient Instructions)</span>
                <button className="btn btn-sm btn-secondary" onClick={() => speak(verifiedExplainer.hindi, 'hi-IN')}>
                  <Volume2 size={14} /> Listen in Hindi
                </button>
              </div>
              <p className="text-sm font-medium" style={{ lineHeight: 1.6 }}>{verifiedExplainer.hindi}</p>
            </div>

            {/* English Explainer */}
            <div style={{ background: 'var(--color-bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                <span className="font-semibold text-sm">English Clinical Copy</span>
                <button className="btn btn-sm btn-secondary" onClick={() => speak(verifiedExplainer.english, 'en-IN')}>
                  <Volume2 size={14} /> Listen in English
                </button>
              </div>
              <p className="text-sm text-secondary">{verifiedExplainer.english}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
