'use client';

import { DEMO_FACILITIES } from '@/lib/demo-data';
import { Building2, Phone, MapPin, Navigation } from 'lucide-react';

export default function AshaFacilities() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Healthcare Facilities</h1>
        <p className="page-subtitle">Nearby healthcare facilities and services</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 'var(--space-lg)' }}>
        <Building2 size={18} />
        <span>DEMO DATA — Facility information shown is for demonstration purposes only. Contact details are not real.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {DEMO_FACILITIES.map(facility => (
          <div key={facility.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                  <h3 className="font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>{facility.name}</h3>
                  <span className="badge badge-primary">{facility.type}</span>
                </div>

                <div className="info-grid" style={{ marginBottom: 'var(--space-md)' }}>
                  <span className="info-label"><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Address</span>
                  <span className="info-value">{facility.address}</span>

                  <span className="info-label"><Navigation size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Distance</span>
                  <span className="info-value">{facility.distance}</span>

                  <span className="info-label"><Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Contact</span>
                  <span className="info-value">{facility.phone}</span>
                </div>

                <div>
                  <span className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Services</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 4 }}>
                    {facility.services.map((s, i) => (
                      <span key={i} className="badge badge-neutral">{s}</span>
                    ))}
                  </div>
                </div>

                {facility.doctors.length > 0 && (
                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    <span className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Doctors</span>
                    <div className="text-sm" style={{ marginTop: 2 }}>{facility.doctors.join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
