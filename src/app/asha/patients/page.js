'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { searchPatients, DEMO_PATIENTS } from '@/lib/demo-data';
import { Search, Plus, ChevronRight } from 'lucide-react';

export default function AshaPatients() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const timer = query; // debounce placeholder — instant for demo
    return searchPatients(query);
  }, [query]);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{DEMO_PATIENTS.length} registered patients</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Register Patient
        </button>
      </div>

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
