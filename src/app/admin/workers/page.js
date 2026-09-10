'use client';
import { DEMO_USERS } from '@/lib/demo-data';
import { Users } from 'lucide-react';

export default function AdminWorkers() {
  const workers = [DEMO_USERS.asha, DEMO_USERS.doctor];
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Workers</h1><p className="page-subtitle">Healthcare workers</p></div>
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Area/Specialization</th><th>PHC</th></tr></thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id}>
                <td><strong>{w.name}</strong><br /><span className="text-xs text-muted">{w.id}</span></td>
                <td><span className="badge badge-primary">{w.role === 'asha' ? 'ASHA Worker' : 'Doctor'}</span></td>
                <td>{w.area || w.specialization}</td>
                <td>{w.phc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
