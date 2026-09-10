'use client';

import { DEMO_PATIENTS, searchPatients } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function DoctorPatients() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchPatients(query), [query]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <p className="page-subtitle">{DEMO_PATIENTS.length} registered patients</p>
      </div>

      <div className="search-container">
        <div className="search-icon"><Search /></div>
        <input className="search-input" placeholder="Search patients..." value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      </div>

      {results.length === 0 ? (
        <div className="card"><div className="empty-state"><p className="empty-state-title">No patients found</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {results.map(p => (
            <div key={p.id} className="patient-card" onClick={() => router.push(`/asha/patients/${p.id}`)}>
              <div className="patient-avatar">{p.name.split(' ').map(w => w[0]).join('').substring(0, 2)}</div>
              <div className="patient-info">
                <div className="patient-name">{p.name}</div>
                <div className="patient-meta">{p.id} | {p.age}y {p.gender} | {p.conditions.join(', ')}</div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
