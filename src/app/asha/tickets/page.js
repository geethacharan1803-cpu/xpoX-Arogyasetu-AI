'use client';

import { useRouter } from 'next/navigation';
import { DEMO_HEALTH_TICKETS } from '@/lib/demo-data';
import { FileText, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

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
  const [filter, setFilter] = useState('all');
  const [tickets, setTickets] = useState(DEMO_HEALTH_TICKETS);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    patientId: 'P-2026-001',
    concern: '',
    symptoms: '',
    priority: 'high',
    bp: '120/80',
    pulse: '76',
    temp: '98.6',
    spo2: '98',
    sugar: '',
  });

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => t.priority === filter);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.concern.trim()) return;

    const patient = DEMO_PATIENTS.find(p => p.id === newTicket.patientId) || DEMO_PATIENTS[0];
    const ticketId = `HT-2026-000${130 + tickets.length}`;
    const todayStr = 'Today';

    const created = {
      id: ticketId,
      patientId: patient.id,
      patientName: patient.name,
      concern: newTicket.concern.trim(),
      priority: newTicket.priority,
      status: 'vitals-added',
      createdDate: todayStr,
      createdBy: 'ASHA Priya',
      timeline: [
        { step: 'Registered', date: todayStr, completed: true, note: 'Health ticket created by ASHA' },
        { step: 'Symptoms Recorded', date: todayStr, completed: true, note: newTicket.symptoms || newTicket.concern },
        { step: 'Vitals Added', date: todayStr, completed: true, note: `BP ${newTicket.bp}, Pulse ${newTicket.pulse}, SpO2 ${newTicket.spo2}%` },
        { step: 'Referred', date: null, completed: false, note: '' },
        { step: 'Doctor Reviewed', date: null, completed: false, note: '' },
        { step: 'Prescription Added', date: null, completed: false, note: '' },
        { step: 'Follow-up Scheduled', date: null, completed: false, note: '' },
      ],
      vitals: {
        bp: newTicket.bp,
        pulse: parseInt(newTicket.pulse) || 76,
        temp: parseFloat(newTicket.temp) || 98.6,
        weight: 60,
        spo2: parseInt(newTicket.spo2) || 98,
        sugar: newTicket.sugar ? parseInt(newTicket.sugar) : null,
      },
      symptoms: newTicket.symptoms || newTicket.concern,
      transcript: null,
      translatedTranscript: null,
      detectedLanguage: 'English',
    };

    setTickets([created, ...tickets]);
    setShowModal(false);
    setNewTicket({
      patientId: 'P-2026-001',
      concern: '',
      symptoms: '',
      priority: 'high',
      bp: '120/80',
      pulse: '76',
      temp: '98.6',
      spo2: '98',
      sugar: '',
    });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div>
          <h1 className="page-title">Health Tickets</h1>
          <p className="page-subtitle">{tickets.length} total tickets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-input"
                  value={newTicket.patientId}
                  onChange={e => setNewTicket({ ...newTicket, patientId: e.target.value })}
                >
                  {DEMO_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.village}</option>
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
                <label className="form-label">Symptoms & Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Describe detailed symptoms observed during home visit..."
                  value={newTicket.symptoms}
                  onChange={e => setNewTicket({ ...newTicket, symptoms: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Classification</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {[
                    { key: 'high', label: 'Urgent / Red Flag' },
                    { key: 'medium', label: 'Moderate' },
                    { key: 'routine', label: 'Routine' },
                  ].map(p => (
                    <button
                      type="button"
                      key={p.key}
                      className={`btn btn-sm ${newTicket.priority === p.key ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setNewTicket({ ...newTicket, priority: p.key })}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)' }}>
                <h4 className="font-semibold text-sm" style={{ marginBottom: 'var(--space-sm)' }}>Vitals Screening</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                  <div>
                    <label className="text-xs text-muted">Blood Pressure (mmHg)</label>
                    <input className="form-input" placeholder="120/80" value={newTicket.bp} onChange={e => setNewTicket({ ...newTicket, bp: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Pulse (bpm)</label>
                    <input className="form-input" placeholder="76" value={newTicket.pulse} onChange={e => setNewTicket({ ...newTicket, pulse: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Temperature (°F)</label>
                    <input className="form-input" placeholder="98.6" value={newTicket.temp} onChange={e => setNewTicket({ ...newTicket, temp: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted">SpO2 (%)</label>
                    <input className="form-input" placeholder="98" value={newTicket.spo2} onChange={e => setNewTicket({ ...newTicket, spo2: e.target.value })} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Health Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'high', label: 'High Priority' },
          { key: 'medium', label: 'Medium' },
        ].map(f => (
          <button key={f.key} className={`tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><FileText /></div>
            <p className="empty-state-title">No health tickets found</p>
            <p className="empty-state-text">No tickets match the selected filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(ticket => {
            const status = STATUS_MAP[ticket.status] || { label: ticket.status, badge: 'badge-neutral' };
            return (
              <div key={ticket.id} className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => router.push(`/asha/tickets/${ticket.id}`)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                      <span className="font-bold text-sm" style={{ color: 'var(--color-primary-700)' }}>{ticket.id}</span>
                      <span className={`badge ${ticket.priority === 'high' ? 'badge-danger' : 'badge-warning'}`}>{ticket.priority}</span>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                    </div>
                    <div className="font-semibold" style={{ marginBottom: 2 }}>{ticket.patientName}</div>
                    <div className="text-sm text-secondary">{ticket.concern}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>Created {ticket.createdDate} by {ticket.createdBy}</div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)', marginTop: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
