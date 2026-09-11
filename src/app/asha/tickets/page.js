'use client';

import { useRouter } from 'next/navigation';
import { FileText, ChevronRight, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

const STATUS_MAP = {
  'registered': { label: 'Registered', badge: 'badge-neutral' },
  'symptoms-recorded': { label: 'Symptoms Recorded', badge: 'badge-neutral' },
  'vitals-added': { label: 'Vitals Added', badge: 'badge-info' },
  'referred': { label: 'Referred', badge: 'badge-warning' },
  'doctor-reviewed': { label: 'Doctor Reviewed', badge: 'badge-primary' },
  'prescription-added': { label: 'Prescription Added', badge: 'badge-success' },
  'follow-up-scheduled': { label: 'Follow-up Scheduled', badge: 'badge-success' },
};

export default function AshaTickets() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [newTicket, setNewTicket] = useState({
    patientId: '',
    concern: '',
    symptoms: '',
    priority: 'high',
    bp: '120/80',
    pulse: '76',
    temp: '98.6',
    spo2: '98',
    sugar: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tksRes, ptsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/patients')
      ]);
      if (tksRes.ok) {
        const d = await tksRes.json();
        setTickets(d.tickets || []);
      }
      if (ptsRes.ok) {
        const pData = await ptsRes.json();
        setPatients(pData.patients || []);
        if (pData.patients && pData.patients.length > 0 && !newTicket.patientId) {
          setNewTicket(prev => ({ ...prev, patientId: pData.patients[0].id }));
        }
      }
    } catch (err) {
      console.error('Error loading tickets/patients:', err);
    } finally {
      setLoading(false);
    }
  }, [newTicket.patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => t.priority === filter);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.concern.trim()) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      const selectedPatient = patients.find(p => p.id === newTicket.patientId) || patients[0];
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          patientId: selectedPatient?.id || 'P-2026-001',
          patientName: selectedPatient?.name || 'Registered Patient',
          createdBy: user?.name || 'ASHA Priya',
        }),
      });

      if (!res.ok) throw new Error('Failed to create health ticket');

      setShowModal(false);
      setNewTicket({
        patientId: patients[0]?.id || '',
        concern: '',
        symptoms: '',
        priority: 'high',
        bp: '120/80',
        pulse: '76',
        temp: '98.6',
        spo2: '98',
        sugar: '',
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError('Unable to create health ticket. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Health Tickets</h1>
          <p className="page-subtitle">{tickets.length} total tickets in database</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); }}>
          <Plus size={16} /> New Ticket
        </button>
      </div>

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
            <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Generate Health Ticket</h3>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-md)' }}>
                <AlertTriangle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-input"
                  value={newTicket.patientId}
                  onChange={e => setNewTicket({ ...newTicket, patientId: e.target.value })}
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id}) &mdash; {p.village}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chief Health Concern *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Persistent high fever and chills for 3 days"
                  value={newTicket.concern}
                  onChange={e => setNewTicket({ ...newTicket, concern: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms &amp; Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Describe detailed symptoms observed during home visit..."
                  value={newTicket.symptoms}
                  onChange={e => setNewTicket({ ...newTicket, symptoms: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-input"
                  value={newTicket.priority}
                  onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <option value="high">High Priority &mdash; Needs Doctor Review</option>
                  <option value="medium">Medium Priority &mdash; Routine Clinical Review</option>
                  <option value="low">Low Priority &mdash; General Monitoring</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Blood Pressure</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="120/80"
                    value={newTicket.bp}
                    onChange={e => setNewTicket({ ...newTicket, bp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pulse (bpm)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="76"
                    value={newTicket.pulse}
                    onChange={e => setNewTicket({ ...newTicket, pulse: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                <div className="form-group">
                  <label className="form-label">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={newTicket.temp}
                    onChange={e => setNewTicket({ ...newTicket, temp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SpO2 (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTicket.spo2}
                    onChange={e => setNewTicket({ ...newTicket, spo2: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sugar (mg/dL)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Optional"
                    value={newTicket.sugar}
                    onChange={e => setNewTicket({ ...newTicket, sugar: e.target.value })}
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
                  {isSubmitting ? 'Saving to Database...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Tickets ({tickets.length})
        </button>
        <button className={`tab ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>
          High Priority ({tickets.filter(t => t.priority === 'high').length})
        </button>
        <button className={`tab ${filter === 'medium' ? 'active' : ''}`} onClick={() => setFilter('medium')}>
          Medium Priority ({tickets.filter(t => t.priority === 'medium').length})
        </button>
      </div>

      {loading ? (
        <div className="loading-container" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" />
          <span>Loading health tickets from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-sm)' }} />
            <p className="empty-state-title">No tickets found</p>
            <p className="empty-state-text">No tickets matching the current filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    <span className="font-semibold text-sm">{t.id}</span>
                    <span className={`badge ${t.priority === 'high' ? 'badge-danger' : 'badge-primary'}`}>{t.priority}</span>
                    <span className={`badge ${STATUS_MAP[t.status]?.badge || 'badge-neutral'}`}>{STATUS_MAP[t.status]?.label || t.status}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginTop: 'var(--space-xs)', marginBottom: 2 }}>{t.concern}</h3>
                  <p className="text-xs text-muted">
                    Patient: <strong>{t.patientName}</strong> ({t.patientId}) &bull; Created: {t.createdDate} by {t.createdBy}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => router.push(`/asha/patients/${t.patientId}`)}
                >
                  View Patient <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
