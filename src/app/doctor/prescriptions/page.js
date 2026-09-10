'use client';

import { useState } from 'react';
import { DEMO_PATIENTS } from '@/lib/demo-data';
import { Pill, AlertTriangle, Search } from 'lucide-react';

export default function DoctorPrescriptions() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

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
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Prescriptions</h1>
        <p className="page-subtitle">Create doctor-approved prescriptions</p>
      </div>

      <div className="alert alert-warning">
        <AlertTriangle size={18} />
        <span>AI does not prescribe medicines. Only the attending doctor creates prescriptions. AI may only translate or explain approved instructions.</span>
      </div>

      {saved && (
        <div className="alert alert-success">Prescription saved successfully.</div>
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
            <button type="submit" className="btn btn-primary"><Pill size={16} /> Save Prescription</button>
            <button type="button" className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
