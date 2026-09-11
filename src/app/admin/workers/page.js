'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw } from 'lucide-react';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'doctor':
      case 'medical_officer':
        return <span className="badge badge-primary">Doctor / MO</span>;
      case 'asha':
      case 'anm':
      case 'cho':
        return <span className="badge badge-info">{role.toUpperCase()} Worker</span>;
      case 'bmo':
      case 'cmho':
      case 'admin':
        return <span className="badge badge-warning">Admin / Officer</span>;
      default:
        return <span className="badge badge-neutral">{role}</span>;
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Healthcare Workers &amp; Staff</h1>
          <p className="page-subtitle">Verified roster of active health workers, doctors, and officers</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchWorkers} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="table-container card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name &amp; ID</th>
              <th>Role</th>
              <th>Assigned Area / PHC</th>
              <th>Contact Phone</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  {loading ? 'Loading registered personnel...' : 'No staff registered.'}
                </td>
              </tr>
            ) : (
              workers.map(w => (
                <tr key={w.id}>
                  <td>
                    <strong>{w.name}</strong>
                    <br />
                    <span className="text-xs text-muted font-mono">{w.id}</span>
                  </td>
                  <td>{getRoleBadge(w.role)}</td>
                  <td>{w.area || w.phc || 'District Wide'}</td>
                  <td>{w.phone || 'N/A'}</td>
                  <td className="text-xs text-muted">
                    {w.created_at ? new Date(w.created_at).toLocaleDateString() : 'Active'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

