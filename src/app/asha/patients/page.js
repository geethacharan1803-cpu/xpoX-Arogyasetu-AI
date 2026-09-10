'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { searchPatients, DEMO_PATIENTS } from '@/lib/demo-data';
import { Search, Plus, ChevronRight } from 'lucide-react';

export default function AshaPatients() {
  const router = useRouter();
  const [patients, setPatients] = useState(DEMO_PATIENTS);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Female',
    village: 'Rampur',
    phone: '',
    bloodGroup: 'B+',
    isPregnant: false,
    pregnancyWeek: '',
    conditions: '',
    allergies: 'None known',
  });

  const results = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }, [query, patients]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!newPatient.name.trim()) return;

    const patientId = `P-2026-${String(patients.length + 1).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const created = {
      id: patientId,
      name: newPatient.name.trim(),
      age: parseInt(newPatient.age) || 30,
      gender: newPatient.gender,
      village: newPatient.village,
      phone: newPatient.phone || '9876XXXX' + Math.floor(10 + Math.random() * 89),
      bloodGroup: newPatient.bloodGroup,
      isPregnant: newPatient.isPregnant,
      pregnancyWeek: newPatient.isPregnant ? parseInt(newPatient.pregnancyWeek) || 12 : null,
      edd: newPatient.isPregnant ? 'In 6 months' : null,
      registeredDate: todayStr,
      lastVisit: 'Today',
      conditions: newPatient.conditions ? newPatient.conditions.split(',').map(c => c.trim()) : ['General Health Intake'],
      allergies: [newPatient.allergies || 'None known'],
      vitals: [
        { date: todayStr, bp: '120/80', pulse: 78, temp: 98.6, weight: 60, spo2: 98 }
      ],
      visits: [
        { date: todayStr, type: 'Field Registration', notes: 'Initial community health registration completed by ASHA.', by: 'ASHA Priya' }
      ],
      prescriptions: [],
      reports: [],
    };

    setPatients([created, ...patients]);
    setShowModal(false);
    setNewPatient({
      name: '',
      age: '',
      gender: 'Female',
      village: 'Rampur',
      phone: '',
      bloodGroup: 'B+',
      isPregnant: false,
      pregnancyWeek: '',
      conditions: '',
      allergies: 'None known',
    });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Community Patients</h1>
          <p className="page-subtitle">{patients.length} registered village members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Register Patient
        </button>
      </div>

      {showModal && (
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
          <div className="card" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Register New Patient</h3>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Kamala Devi"
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 26"
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={newPatient.gender}
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Village</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newPatient.village}
                    onChange={e => setNewPatient({ ...newPatient, village: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-input"
                    value={newPatient.bloodGroup}
                    onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ padding: 'var(--space-sm)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={newPatient.isPregnant}
                    onChange={e => setNewPatient({ ...newPatient, isPregnant: e.target.checked })}
                  />
                  <span>Is this patient currently pregnant? (ANC Tracking)</span>
                </label>
                {newPatient.isPregnant && (
                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    <label className="form-label">Gestational Week</label>
                    <input
                      type="number"
                      min="1"
                      max="42"
                      className="form-input"
                      placeholder="Current week (e.g. 14)"
                      value={newPatient.pregnancyWeek}
                      onChange={e => setNewPatient({ ...newPatient, pregnancyWeek: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Known Health Conditions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mild Anemia, Hypertension (comma separated)"
                  value={newPatient.conditions}
                  onChange={e => setNewPatient({ ...newPatient, conditions: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-container">
        <div className="search-icon"><Search /></div>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, ID, phone number, or village..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Search /></div>
            <p className="empty-state-title">No patients found</p>
            <p className="empty-state-text">Try searching with a different name, ID, or phone number.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {results.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => router.push(`/asha/patients/${patient.id}`)}
            >
              <div className="patient-avatar">
                {patient.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
              </div>
              <div className="patient-info">
                <div className="patient-name">{patient.name}</div>
                <div className="patient-meta">
                  {patient.id} &middot; {patient.age}y {patient.gender} &middot; {patient.village}
                </div>
                <div className="patient-meta" style={{ marginTop: 2 }}>
                  {patient.conditions.join(', ')}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {patient.isPregnant && <span className="badge badge-info">Pregnant W{patient.pregnancyWeek}</span>}
                <span className="text-xs text-muted">Last: {patient.lastVisit}</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
