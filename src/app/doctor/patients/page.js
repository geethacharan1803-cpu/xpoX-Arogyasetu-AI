'use client';

import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export default function DoctorPatients() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchPatients = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const url = q.trim() ? `/api/patients?q=${encodeURIComponent(q.trim())}` : '/api/patients';
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setPatients(d.patients || []);
      }
    } catch (e) {
      console.error('Error fetching doctor patients:', e);
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patient Directory</h1>
        <p className="page-subtitle">{patients.length} registered patients in database</p>
      </div>

      <div className="search-container">
        <div className="search-icon"><Search /></div>
        <input
          className="search-input"
          placeholder="Search patients by name, ID, village, or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Searching patient records in database...</span>
        </div>
      ) : patients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">No patients found</p>
            <p className="empty-state-text">No records matched your search query in the database.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {patients.map(p => (
            <div
              key={p.id}
              className="patient-card"
              onClick={() => router.push(`/doctor/patients/${p.id}`)}
            >
              <div className="patient-avatar">
                {p.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
              </div>
              <div className="patient-info">
                <div className="patient-name">{p.name}</div>
                <div className="patient-meta">
                  {p.id} &bull; {p.age}y {p.gender} &bull; {p.village}
                </div>
                <div className="patient-meta" style={{ marginTop: 2 }}>
                  {p.conditions && Array.isArray(p.conditions) ? p.conditions.join(', ') : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                {p.isPregnant && <span className="badge badge-info">Pregnant</span>}
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
