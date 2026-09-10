'use client';
import { DEMO_FACILITIES } from '@/lib/demo-data';
import { Building2 } from 'lucide-react';

export default function AdminPHCs() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">PHCs</h1>
        <p className="page-subtitle">Primary Health Centres and facilities</p>
      </div>
      <div className="alert alert-info"><Building2 size={18} /><span>DEMO DATA - Facility information is for demonstration only.</span></div>
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Address</th><th>Distance</th><th>Services</th></tr></thead>
          <tbody>
            {DEMO_FACILITIES.map(f => (
              <tr key={f.id}>
                <td><strong>{f.name}</strong></td>
                <td><span className="badge badge-primary">{f.type}</span></td>
                <td>{f.address}</td>
                <td>{f.distance}</td>
                <td>{f.services.slice(0, 3).join(', ')}{f.services.length > 3 ? '...' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
