'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ChevronRight, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AshaPatients() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);

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
    bp: '120/80',
    pulse: '76',
    temp: '98.6',
    weight: '60',
    spo2: '98',
  });

  const fetchPatients = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError('');
    try {
      const url = searchQuery.trim()
        ? `/api/patients?q=${encodeURIComponent(searchQuery.trim())}`
        : '/api/patients';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Database query returned an error');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
      setError('Unable to load patient records from database. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, fetchPatients]);

  const handleRegister = async (e, forceCreate = false) => {
    if (e) e.preventDefault();
    if (!newPatient.name.trim()) {
      setFormError('Patient full name is required');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      // If not forced, check for duplicates first
      if (!forceCreate && !duplicateWarning) {
        const dupCheckRes = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newPatient.name.trim(),
            phone: newPatient.phone.trim(),
            village: newPatient.village,
            checkDuplicateOnly: true,
          }),
        });

        if (dupCheckRes.ok) {
          const dupData = await dupCheckRes.json();
          if (dupData.possibleDuplicate && dupData.existingPatient) {
            setDuplicateWarning(dupData.existingPatient);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Save to real database
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPatient,
          createdBy: user?.name || 'ASHA Priya',
        }),
      });

      if (!res.ok) {
        throw new Error('Database save failed');
      }

      const data = await res.json();
      if (data.success && data.patient) {
        setShowModal(false);
        setDuplicateWarning(null);
        // Navigate directly to the newly saved patient profile
        router.push(`/asha/patients/${data.patient.id}`);
      } else {
        throw new Error(data.error || 'Unable to save record');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setFormError('Unable to save patient information. Please check the connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Community Patients</h1>
          <p className="page-subtitle">
            {patients.length} registered village members &bull; Persistent Relational Database
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setDuplicateWarning(null); setFormError(''); }}>
          <Plus size={16} /> Register Patient
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--space-md)' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => fetchPatients(query)} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

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

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-md)' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {duplicateWarning && (
              <div className="alert alert-warning" style={{ marginBottom: 'var(--space-md)', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <AlertTriangle size={18} />
                  <span>Possible Existing Patient Found</span>
                </div>
                <p className="text-sm" style={{ marginTop: 4 }}>
                  A record already exists for <strong>{duplicateWarning.name}</strong> ({duplicateWarning.id}) in <strong>{duplicateWarning.village}</strong>.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => router.push(`/asha/patients/${duplicateWarning.id}`)}
                  >
                    View Existing Patient
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleRegister(null, true)}
                  >
                    Create New Record Anyway
                  </button>
                </div>
              </div>
            )}

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Blood Pressure (Initial)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="120/80"
                    value={newPatient.bp}
                    onChange={e => setNewPatient({ ...newPatient, bp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pulse (bpm)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="76"
                    value={newPatient.pulse}
                    onChange={e => setNewPatient({ ...newPatient, pulse: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving to Database...' : 'Complete Registration'}
                </button>
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
          placeholder="Search by name, patient ID, phone number, or village..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading patient records from database...</span>
        </div>
      ) : patients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Search /></div>
            <p className="empty-state-title">No patients found</p>
            <p className="empty-state-text">
              {query ? `No records matching "${query}" in database.` : 'No patients registered in this area yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {patients.map((patient) => (
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
                  {patient.conditions && Array.isArray(patient.conditions) ? patient.conditions.join(', ') : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {patient.isPregnant && <span className="badge badge-info">Pregnant W{patient.pregnancyWeek}</span>}
                <span className="text-xs text-muted">Registered: {patient.registeredDate}</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
