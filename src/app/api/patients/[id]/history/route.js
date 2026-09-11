import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const patientId = params.id;

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const pid = patient.patient_id;
    const historyEvents = [];

    // 1. Patient Registration Event
    if (patient.created_at) {
      const regDate = patient.created_at.split('T')[0].split(' ')[0];
      historyEvents.push({
        id: `event-reg-${pid}`,
        type: 'Patient Registered',
        category: 'registration',
        date: regDate,
        title: 'Community Health Registration',
        description: `Patient registered by ${patient.created_by || 'ASHA Worker'}. Age: ${patient.age}, Gender: ${patient.gender}, Village: ${patient.village}.`,
        performedBy: patient.created_by || 'ASHA Worker',
        badge: 'badge-primary',
        rawTimestamp: new Date(patient.created_at).getTime() || 0,
      });
    }

    // 2. Visits (ANC, Field, Regular, Hospital)
    const visitsRes = await query('SELECT * FROM hospital_visits WHERE patient_id = ? ORDER BY visit_date ASC', [pid]);
    for (const v of visitsRes.rows) {
      historyEvents.push({
        id: `event-visit-${v.id}`,
        type: v.visit_type || 'Visit',
        category: 'visit',
        date: v.visit_date,
        title: `${v.visit_type || 'Health Visit'} at ${v.facility_name || 'Community Centre'}`,
        description: v.notes || (v.reason ? `Reason: ${v.reason}` : 'Clinical consultation and checkup recorded.'),
        performedBy: v.doctor || 'Healthcare Provider',
        badge: 'badge-info',
        rawTimestamp: new Date(v.visit_date).getTime() || 0,
      });
    }

    // 3. Vitals recordings
    const vitalsRes = await query('SELECT * FROM patient_vitals WHERE patient_id = ? ORDER BY recorded_at ASC', [pid]);
    for (const vt of vitalsRes.rows) {
      const vDate = vt.recorded_at ? vt.recorded_at.split('T')[0].split(' ')[0] : 'Recorded';
      const details = [
        vt.blood_pressure ? `BP: ${vt.blood_pressure}` : null,
        vt.pulse ? `Pulse: ${vt.pulse} bpm` : null,
        vt.temperature ? `Temp: ${vt.temperature}°F` : null,
        vt.spo2 ? `SpO2: ${vt.spo2}%` : null,
        vt.blood_sugar ? `Sugar: ${vt.blood_sugar} mg/dL` : null,
        vt.weight ? `Weight: ${vt.weight} kg` : null,
      ].filter(Boolean).join(' | ');

      historyEvents.push({
        id: `event-vital-${vt.id}`,
        type: 'Vitals Recorded',
        category: 'vitals',
        date: vDate,
        title: 'Vital Signs Assessment',
        description: details || 'Routine vital signs recorded.',
        performedBy: vt.recorded_by || 'ASHA Worker',
        badge: 'badge-neutral',
        rawTimestamp: new Date(vt.recorded_at).getTime() || 0,
      });
    }

    // 4. Symptoms / Problems recorded
    const problemsRes = await query('SELECT * FROM patient_problems WHERE patient_id = ? ORDER BY created_at ASC', [pid]);
    for (const pr of problemsRes.rows) {
      const prDate = pr.created_at ? pr.created_at.split('T')[0].split(' ')[0] : 'Reported';
      historyEvents.push({
        id: `event-problem-${pr.id}`,
        type: 'Symptoms Recorded',
        category: 'symptoms',
        date: prDate,
        title: 'Health Intake & Symptoms',
        description: pr.description,
        performedBy: pr.recorded_by || 'ASHA Worker',
        badge: 'badge-warning',
        rawTimestamp: new Date(pr.created_at).getTime() || 0,
      });
    }

    // 5. Health Tickets
    const ticketsRes = await query('SELECT * FROM health_tickets WHERE patient_id = ? ORDER BY created_at ASC', [pid]);
    for (const tk of ticketsRes.rows) {
      const tkDate = tk.created_at ? tk.created_at.split('T')[0].split(' ')[0] : 'Created';
      historyEvents.push({
        id: `event-ticket-${tk.id}`,
        type: 'Health Ticket Generated',
        category: 'ticket',
        date: tkDate,
        title: `Health Ticket #${tk.ticket_number || tk.id}`,
        description: `Chief Concern: ${tk.concern} (Priority: ${tk.priority.toUpperCase()}, Status: ${tk.status})`,
        performedBy: tk.created_by || 'ASHA Worker',
        badge: tk.priority === 'high' ? 'badge-danger' : 'badge-primary',
        rawTimestamp: new Date(tk.created_at).getTime() || 0,
      });
    }

    // 6. Referrals
    const referralsRes = await query('SELECT * FROM referrals WHERE patient_id = ? ORDER BY created_at ASC', [pid]);
    for (const ref of referralsRes.rows) {
      const refDate = ref.created_at ? ref.created_at.split('T')[0].split(' ')[0] : 'Referred';
      historyEvents.push({
        id: `event-ref-${ref.id}`,
        type: 'Clinical Referral',
        category: 'referral',
        date: refDate,
        title: `Referred to ${ref.referred_to || 'PHC/Hospital'}`,
        description: `Reason: ${ref.reason} | Status: ${ref.status.toUpperCase()} | Priority: ${ref.priority}`,
        performedBy: ref.referred_by || 'ASHA Worker',
        badge: 'badge-warning',
        rawTimestamp: new Date(ref.created_at).getTime() || 0,
      });
    }

    // 7. Doctor Prescriptions
    const rxRes = await query('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at ASC', [pid]);
    for (const rx of rxRes.rows) {
      const itemsRes = await query('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.prescription_id]);
      const medList = itemsRes.rows.map(i => `${i.medicine_name} (${i.dose || ''} ${i.frequency || ''} for ${i.duration || ''})`.trim()).join(', ');
      
      historyEvents.push({
        id: `event-rx-${rx.id}`,
        type: 'Doctor Prescription',
        category: 'prescription',
        date: rx.prescription_date || (rx.created_at ? rx.created_at.split('T')[0] : 'Prescribed'),
        title: `Prescription Authorized by ${rx.doctor_name || 'Medical Officer'}`,
        description: `Authorized Medicines: ${medList || 'Standard medication protocol'}. Notes: ${rx.notes || 'Take as directed.'}`,
        performedBy: rx.doctor_name || 'Medical Officer',
        badge: 'badge-success',
        rawTimestamp: new Date(rx.created_at || rx.prescription_date).getTime() || 0,
      });
    }

    // 8. Follow-ups
    const followupsRes = await query('SELECT * FROM followups WHERE patient_id = ? ORDER BY created_at ASC', [pid]);
    for (const fu of followupsRes.rows) {
      historyEvents.push({
        id: `event-fu-${fu.id}`,
        type: 'Follow-up Scheduled',
        category: 'followup',
        date: fu.followup_date,
        title: `${fu.followup_type || 'Follow-up'} Due on ${fu.followup_date}`,
        description: `Reason: ${fu.reason} | Status: ${fu.status.toUpperCase()} | Assigned: ${fu.assigned_to}`,
        performedBy: fu.assigned_to || 'ASHA Worker',
        badge: fu.status === 'overdue' ? 'badge-danger' : 'badge-info',
        rawTimestamp: new Date(fu.followup_date).getTime() || 0,
      });
    }

    // Sort chronologically descending (newest first for timeline display)
    historyEvents.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

    return NextResponse.json({
      patientId: pid,
      totalEvents: historyEvents.length,
      history: historyEvents,
    });

  } catch (error) {
    console.error('Error fetching patient history:', error);
    return NextResponse.json({ error: 'Failed to retrieve chronological patient history' }, { status: 500 });
  }
}
