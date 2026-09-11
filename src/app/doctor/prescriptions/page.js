'use client';

import { useState, useEffect } from 'react';
import { Pill, AlertTriangle, Volume2, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)', duration: '30 days' },
  ]);
  const [notes, setNotes] = useState('Monitor fasting sugar and record daily blood pressure with ASHA Priya.');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedExplainer, setVerifiedExplainer] = useState(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch('/api/patients');
        if (res.ok) {
          const d = await res.json();
          setPatients(d.patients || []);
          if (d.patients && d.patients.length > 0) {
            setSelectedPatient(d.patients[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading patients for prescriptions:', err);
      }
    }
    loadPatients();
  }, []);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days' }]);
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

  const handleSave = async (e) => {
    e.preventDefault();
    const validMeds = medicines.filter(m => m.name.trim());
    if (validMeds.length === 0 || !selectedPatient) return;

    setIsSubmitting(true);
    const patient = patients.find(p => p.id === selectedPatient) || { name: 'Patient', id: selectedPatient };
    const medList = validMeds.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ');

    const teluguText = `రోగి ${patient.name} కొరకు వైద్యుల సూచనలు: ${medList}. మందులను ప్రతిరోజూ క్రమం తప్పకుండా భోజనం తర్వాత తగినంత నీటితో మాత్రమే వేసుకోవాలి. మోతాదు మార్చవద్దు.`;
    const hindiText = `मरीज ${patient.name} के लिए डॉक्टर की सलाह: ${medList}। दवाइयां नियमित रूप से भोजन के बाद पर्याप्त पानी के साथ लें। खुराक में कोई बदलाव न करें।`;
    const englishText = `Verified Instructions for ${patient.name}: ${medList}. Take strictly as directed after meals. Do not alter dose or duration without consulting your PHC doctor.`;

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient,
          doctorId: user?.id || 'U-002',
          doctorName: user?.name || 'Dr. Sharma',
          medicines: validMeds,
          notes,
          teluguInstructions: teluguText,
          hindiInstructions: hindiText,
          englishInstructions: englishText,
        }),
      });

      if (!res.ok) throw new Error('Database save failed');

      setSaved(true);
      setVerifiedExplainer({
        patientName: patient.name,
        patientId: patient.id,
        prescribedMedicines: validMeds,
        telugu: teluguText,
        hindi: hindiText,
        english: englishText,
        notes,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error('Error saving prescription:', err);
      alert('Unable to authorize prescription in database. Please check connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const speak = (text, lang) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
        <h1 className="page-title">Prescriptions &amp; Care Directives</h1>
        <p className="page-subtitle">Clinician-authorized prescriptions persisted in database with verified vernacular directives</p>
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
          <span>Prescription authorized and locked into patient clinical continuity database.</span>
        </div>
      )}

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>New Prescription</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select
              className="form-select"
              value={selectedPatient}
              onChange={e => setSelectedPatient(e.target.value)}
              required
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id}) &mdash; {p.village}</option>
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
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeMedicine(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Clinical Notes</label>
            <textarea className="form-textarea" placeholder="Additional instructions or notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Pill size={16} /> {isSubmitting ? 'Authorizing & Saving...' : 'Authorize & Save Prescription'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setVerifiedExplainer(null)}>Reset</button>
          </div>
        </form>
      </div>

      {verifiedExplainer && (
        <div className="card" style={{ marginTop: 'var(--space-lg)', borderLeft: '4px solid var(--color-primary)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <div>
              <h3 className="card-title">Verified Patient Explainer &mdash; &ldquo;Voice Back to Patient&rdquo;</h3>
              <p className="text-xs text-muted">Generated for {verifiedExplainer.patientName} ({verifiedExplainer.patientId}) at {verifiedExplainer.timestamp}</p>
            </div>
            <span className="badge badge-success">Saved to Database</span>
          </div>

          {/* Telugu */}
          <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <span className="badge badge-info">తెలుగు (Telugu)</span>
              <button className="btn btn-sm btn-secondary" onClick={() => speak(verifiedExplainer.telugu, 'te-IN')}>
                <Volume2 size={14} /> Listen
              </button>
            </div>
            <p className="text-sm">{verifiedExplainer.telugu}</p>
          </div>

          {/* Hindi */}
          <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <span className="badge badge-info">हिन्दी (Hindi)</span>
              <button className="btn btn-sm btn-secondary" onClick={() => speak(verifiedExplainer.hindi, 'hi-IN')}>
                <Volume2 size={14} /> Listen
              </button>
            </div>
            <p className="text-sm">{verifiedExplainer.hindi}</p>
          </div>

          {/* English */}
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <span className="badge badge-info">English</span>
              <button className="btn btn-sm btn-secondary" onClick={() => speak(verifiedExplainer.english, 'en-IN')}>
                <Volume2 size={14} /> Listen
              </button>
            </div>
            <p className="text-sm">{verifiedExplainer.english}</p>
          </div>
        </div>
      )}
    </div>
  );
}
