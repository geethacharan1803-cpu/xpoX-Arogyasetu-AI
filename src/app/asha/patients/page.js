'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ChevronRight, AlertTriangle, CheckCircle, RefreshCw, WifiOff, Cloud } from 'lucide-react';
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
  const [offlineNotice, setOfflineNotice] = useState('');
  const [offlineCount, setOfflineCount] = useState(0);

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

  // Helper to read offline patients from localStorage
  const getOfflinePatients = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('arogyasetu_offline_patients');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Helper to sync pending offline registrations when connected
  const syncOfflineQueue = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    try {
      const offlineList = getOfflinePatients();
      if (!offlineList || offlineList.length === 0) {
        setOfflineCount(0);
        return;
      }

      const remaining = [];
      let syncedAny = false;

      for (const p of offlineList) {
        try {
          const res = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: p.name,
              age: p.age,
              gender: p.gender,
              village: p.village,
              phone: p.phone,
              bloodGroup: p.bloodGroup,
              isPregnant: p.isPregnant,
              pregnancyWeek: p.pregnancyWeek,
              conditions: p.conditions,
              allergies: p.allergies,
              bp: p.bp,
              pulse: p.pulse,
              temp: p.temp,
              weight: p.weight,
              spo2: p.spo2,
              createdBy: p.createdBy,
            }),
          });

          if (res.ok) {
            syncedAny = true;
          } else {
            remaining.push(p);
          }
        } catch {
          remaining.push(p);
        }
      }

      localStorage.setItem('arogyasetu_offline_patients', JSON.stringify(remaining));
      setOfflineCount(remaining.length);

      if (syncedAny) {
        setOfflineNotice('Offline records successfully synchronized with the central database.');
        setTimeout(() => setOfflineNotice(''), 5000);
        fetchPatients(query);
      }
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    }
  }, [getOfflinePatients, query]);

  const fetchPatients = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError('');
    const offlineList = getOfflinePatients();
    setOfflineCount(offlineList.length);

    try {
      const url = searchQuery.trim()
        ? `/api/patients?q=${encodeURIComponent(searchQuery.trim())}`
        : '/api/patients';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Database query returned an error');
      const data = await res.json();
      
      const serverPatients = data.patients || [];
      // Merge with offline patients not yet in server list
      const merged = [
        ...offlineList.filter(op => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.trim().toLowerCase();
          return (
            (op.name || '').toLowerCase().includes(q) ||
            (op.village || '').toLowerCase().includes(q) ||
            (op.phone || '').includes(q)
          );
        }),
        ...serverPatients.filter(sp => !offlineList.some(op => op.id === sp.id || (op.name === sp.name && op.phone === sp.phone)))
      ];

      setPatients(merged);
    } catch (err) {
      console.warn('Backend unavailable, rendering local offline cache:', err);
      if (offlineList.length > 0) {
        setPatients(offlineList);
        setError('Operating in offline mode. Showing local patient records.');
      } else {
        setError('Unable to reach database. Showing local offline cache if available.');
      }
    } finally {
      setLoading(false);
    }
  }, [getOfflinePatients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, fetchPatients]);

  useEffect(() => {
    const handleOnline = () => syncOfflineQueue();
    window.addEventListener('online', handleOnline);
    syncOfflineQueue();
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineQueue]);

  // Fallback saver to localStorage when network or server is unreachable
  const saveToOfflineQueue = (patientPayload) => {
    const offlineId = `P-OFFLINE-${Date.now().toString().slice(-4)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    
    const conditionsArr = Array.isArray(patientPayload.conditions)
      ? patientPayload.conditions
      : (patientPayload.conditions ? String(patientPayload.conditions).split(',').map(c => c.trim()).filter(Boolean) : ['General Health Intake']);

    const allergiesArr = Array.isArray(patientPayload.allergies)
      ? patientPayload.allergies
      : (patientPayload.allergies ? String(patientPayload.allergies).split(',').map(a => a.trim()).filter(Boolean) : ['None known']);

    const offlineRecord = {
      ...patientPayload,
      id: offlineId,
      patient_id: offlineId,
      name: patientPayload.name.trim(),
      age: parseInt(patientPayload.age, 10) || 30,
      gender: patientPayload.gender || 'Female',
      village: (patientPayload.village || 'Rampur').trim(),
      phone: (patientPayload.phone || '').trim() || '9876XXXXXX',
      bloodGroup: patientPayload.bloodGroup || 'B+',
      isPregnant: Boolean(patientPayload.isPregnant),
      pregnancyWeek: patientPayload.pregnancyWeek ? parseInt(patientPayload.pregnancyWeek, 10) : null,
      conditions: conditionsArr,
      allergies: allergiesArr,
      registeredDate: todayStr,
      created_at: todayStr,
      isOffline: true,
      offlineSyncPending: true,
      vitals: [
        {
          date: todayStr,
          bp: patientPayload.bp || '120/80',
          pulse: parseInt(patientPayload.pulse, 10) || 76,
          temp: parseFloat(patientPayload.temp) || 98.6,
          weight: parseFloat(patientPayload.weight) || 60,
          spo2: parseInt(patientPayload.spo2, 10) || 98,
          recordedBy: patientPayload.createdBy || 'ASHA Priya',
        }
      ],
      visits: [
        {
          date: todayStr,
          type: 'Field Registration',
          facility: 'Community Outreach',
          doctor: patientPayload.createdBy || 'ASHA Priya',
          notes: 'Registered in offline field intake.'
        }
      ],
      medications: [],
      prescriptions: [],
      tickets: [],
      referrals: [],
      followups: []
    };

    try {
      const existing = getOfflinePatients();
      const updated = [offlineRecord, ...existing.filter(p => p.id !== offlineId)];
      localStorage.setItem('arogyasetu_offline_patients', JSON.stringify(updated));
      localStorage.setItem(`arogyasetu_patient_${offlineId}`, JSON.stringify(offlineRecord));
      setOfflineCount(updated.length);
    } catch (e) {
      console.error('Failed writing to localStorage:', e);
    }

    setPatients(prev => [offlineRecord, ...prev.filter(p => p.id !== offlineId)]);
    setShowModal(false);
    setDuplicateWarning(null);
    setOfflineNotice(`Patient ${offlineRecord.name} (${offlineId}) safely saved to offline storage! It will sync to the database automatically.`);
    setTimeout(() => setOfflineNotice(''), 7000);
  };

  const handleRegister = async (e, forceCreate = false) => {
    if (e) e.preventDefault();
    if (!newPatient.name.trim()) {
      setFormError('Patient full name is required');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const payload = {
      ...newPatient,
      createdBy: user?.name || 'ASHA Priya',
    };

    try {
      // 1. If not forced, check for duplicates first (non-blocking if offline)
      if (!forceCreate && !duplicateWarning) {
        try {
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
        } catch {
          // If duplicate check network fails, proceed to direct save or offline queue
        }
      }

      // 2. Attempt save to database
      let res;
      try {
        res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (netErr) {
        console.warn('Network unreachable, switching to offline fallback queue:', netErr);
        saveToOfflineQueue(payload);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // If server returns 500 or connection error, provide offline fallback
        if (res.status >= 500) {
          console.warn('Server error on save, activating offline safe queue:', errData);
          saveToOfflineQueue(payload);
          return;
        }
        setFormError(errData.error || errData.details || `Unable to save patient record (Error ${res.status})`);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.success && data.patient) {
        setShowModal(false);
        setDuplicateWarning(null);
        // Direct navigation to newly registered patient profile
        router.push(`/asha/patients/${data.patient.id}`);
      } else {
        setFormError(data.error || 'Unable to save record');
      }
    } catch (err) {
      console.error('Registration exception, safely activating offline fallback:', err);
      saveToOfflineQueue(payload);
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
            {patients.length} registered village members &bull; Persistent Relational Database {offlineCount > 0 ? `(${offlineCount} offline queued)` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {offlineCount > 0 && (
            <button className="btn btn-secondary" onClick={syncOfflineQueue} title="Sync pending offline patients to database">
              <Cloud size={16} /> Sync ({offlineCount})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setDuplicateWarning(null); setFormError(''); }}>
            <Plus size={16} /> Register Patient
          </button>
        </div>
      </div>

      {offlineNotice && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>
          <CheckCircle size={18} />
          <span>{offlineNotice}</span>
        </div>
      )}

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
                {(patient.name || 'P').split(' ').map(w => w[0]).join('').substring(0, 2)}
              </div>
              <div className="patient-info">
                <div className="patient-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{patient.name}</span>
                  {patient.isOffline && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      Offline (Queued)
                    </span>
                  )}
                </div>
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
