'use client';

import { useState, useEffect } from 'react';
import { DEMO_FACILITIES } from '@/lib/demo-data';
import { ArrowRightLeft, Building2, User, Clock, AlertTriangle, CheckCircle, Search, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  'pending': { label: 'Pending Review', badge: 'badge-warning' },
  'in-review': { label: 'In Review', badge: 'badge-primary' },
  'accepted': { label: 'Accepted', badge: 'badge-info' },
  'completed': { label: 'Completed', badge: 'badge-success' },
  'cancelled': { label: 'Cancelled', badge: 'badge-neutral' },
};

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.referrals || []).map(r => ({
          id: r.id,
          patientId: r.patient_id || r.patientId,
          patientName: r.patient_name || r.patientName || 'Unknown Patient',
          ticketId: r.ticket_id || r.ticketId,
          destination: r.destination || r.destination_facility || 'PHC',
          reason: r.reason,
          priority: r.priority || 'medium',
          status: r.status || 'pending',
          createdBy: r.created_by || r.createdBy || 'ASHA Worker',
          createdDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : 'Today',
        }));
        setReferrals(mapped);
      }
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const total = referrals.length;
  const pending = referrals.filter(r => r.status === 'pending').length;
  const inReview = referrals.filter(r => r.status === 'in-review').length;
  const accepted = referrals.filter(r => r.status === 'accepted').length;
  const completed = referrals.filter(r => r.status === 'completed').length;

  const filtered = referrals.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (facilityFilter !== 'all' && r.destination !== facilityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q) ||
        (r.reason && r.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });


  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Referral Oversight</h1>
        <p className="page-subtitle">
          District-level SevaConnect transfer coordination and facility referral tracking
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon info"><ArrowRightLeft size={22} /></div>
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Referrals</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon warning"><Clock size={22} /></div>
          <div>
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('in-review')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon primary"><AlertTriangle size={22} /></div>
          <div>
            <div className="stat-value">{inReview}</div>
            <div className="stat-label">In Clinical Review</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('accepted')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon info"><Building2 size={22} /></div>
          <div>
            <div className="stat-value">{accepted}</div>
            <div className="stat-label">Accepted at Facility</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter('completed')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon success"><CheckCircle size={22} /></div>
          <div>
            <div className="stat-value">{completed}</div>
            <div className="stat-label">Resolved / Discharged</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {[
              { key: 'all', label: `All (${total})` },
              { key: 'pending', label: `Pending (${pending})` },
              { key: 'in-review', label: `In Review (${inReview})` },
              { key: 'accepted', label: `Accepted (${accepted})` },
              { key: 'completed', label: `Completed (${completed})` },
            ].map(tab => (
              <button
                key={tab.key}
                className={`tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flex: 1, minWidth: 260, maxWidth: 400 }}>
            <div className="search-bar" style={{ width: '100%' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search patient, facility, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Referrals Table / Card list */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><ArrowRightLeft size={36} /></div>
            <p className="empty-state-title">No referrals found</p>
            <p className="empty-state-text">No records match the current filter or search criteria.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Referral ID</th>
                  <th>Patient</th>
                  <th>Reason / Clinical Need</th>
                  <th>Priority</th>
                  <th>Destination Facility</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ref => {
                  const statusInfo = STATUS_CONFIG[ref.status] || { label: ref.status, badge: 'badge-neutral' };
                  return (
                    <tr key={ref.id}>
                      <td>
                        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{ref.id}</span>
                        <div className="text-xs text-muted">{ref.ticketId}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{ref.patientName}</div>
                        <div className="text-xs text-muted">{ref.patientId}</div>
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <span className="text-sm">{ref.reason}</span>
                      </td>
                      <td>
                        <span className={`badge ${ref.priority === 'high' ? 'badge-danger' : ref.priority === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                          {ref.priority.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} className="text-muted" />
                          <span className="font-medium text-sm">{ref.destination}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} className="text-muted" />
                          <span className="text-sm">{ref.createdBy}</span>
                        </div>
                      </td>
                      <td className="text-sm text-secondary">{ref.createdDate}</td>
                      <td>
                        <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
