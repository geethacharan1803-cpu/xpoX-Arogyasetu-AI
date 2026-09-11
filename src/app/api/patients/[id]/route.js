import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const patientId = params.id;

    // Retrieve patient record
    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);

    if (!patient) {
      return NextResponse.json({ error: 'Patient record not found' }, { status: 404 });
    }

    const pid = patient.patient_id;

    // Retrieve latest vitals
    const vitalsRes = await query('SELECT * FROM patient_vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 10', [pid]);
    const vitals = vitalsRes.rows.map(v => ({
      id: v.id,
      date: v.recorded_at ? v.recorded_at.split('T')[0].split(' ')[0] : 'N/A',
      bp: v.blood_pressure || '-',
      pulse: v.pulse || '-',
      temp: v.temperature || '-',
      weight: v.weight || '-',
      spo2: v.spo2 || '-',
      sugar: v.blood_sugar,
      hemoglobin: v.hemoglobin,
      recordedBy: v.recorded_by,
    }));

    // Retrieve medications
    const medsRes = await query('SELECT * FROM medications WHERE patient_id = ? ORDER BY created_at DESC', [pid]);
    const medications = medsRes.rows.map(m => ({
      id: m.id,
      name: m.medicine_name,
      dosage: m.dose,
      frequency: m.frequency,
      duration: m.duration,
      startDate: m.start_date,
      endDate: m.end_date,
      doctor: m.prescribing_doctor,
      status: m.status, // CURRENT, COMPLETED, DISCONTINUED
    }));

    // Retrieve prescriptions
    const rxRes = await query('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC', [pid]);
    const prescriptions = [];
    for (const rx of rxRes.rows) {
      const itemsRes = await query('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.prescription_id]);
      prescriptions.push({
        id: rx.prescription_id,
        date: rx.prescription_date,
        doctor: rx.doctor_name,
        notes: rx.notes,
        status: rx.prescription_status,
        medicines: itemsRes.rows.map(i => ({
          name: i.medicine_name,
          dosage: i.dose,
          frequency: i.frequency,
          duration: i.duration,
        })),
        telugu: rx.telugu_instructions,
        hindi: rx.hindi_instructions,
        english: rx.english_instructions,
      });
    }

    // Retrieve visits
    const visitsRes = await query('SELECT * FROM hospital_visits WHERE patient_id = ? ORDER BY visit_date DESC', [pid]);
    const visits = visitsRes.rows.map(v => ({
      id: v.id,
      date: v.visit_date,
      type: v.visit_type,
      facility: v.facility_name,
      doctor: v.doctor,
      notes: v.notes,
      assessment: v.assessment,
      by: v.doctor || 'Healthcare Provider',
    }));

    // Retrieve tickets
    const ticketsRes = await query('SELECT * FROM health_tickets WHERE patient_id = ? ORDER BY created_at DESC', [pid]);
    const tickets = ticketsRes.rows.map(t => ({
      id: t.ticket_number || t.id,
      concern: t.concern,
      priority: t.priority,
      status: t.status,
      createdDate: t.created_at ? t.created_at.split('T')[0].split(' ')[0] : 'Today',
      createdBy: t.created_by,
      vitals: t.vitals_json ? JSON.parse(t.vitals_json) : null,
      timeline: t.timeline_json ? JSON.parse(t.timeline_json) : [],
    }));

    // Retrieve referrals
    const referralsRes = await query('SELECT * FROM referrals WHERE patient_id = ? ORDER BY created_at DESC', [pid]);
    const referrals = referralsRes.rows.map(r => ({
      id: r.referral_id || r.id,
      reason: r.reason,
      priority: r.priority,
      destination: r.referred_to,
      createdBy: r.referred_by,
      createdDate: r.created_at ? r.created_at.split('T')[0].split(' ')[0] : 'Today',
      status: r.status,
    }));

    // Retrieve follow-ups
    const followupsRes = await query('SELECT * FROM followups WHERE patient_id = ? ORDER BY followup_date ASC', [pid]);
    const followups = followupsRes.rows.map(f => ({
      id: f.followup_id || f.id,
      reason: f.reason,
      dueDate: f.followup_date,
      status: f.status,
      type: f.followup_type,
      assignedTo: f.assigned_to,
    }));

    // Retrieve voice records
    const voiceRes = await query('SELECT * FROM voice_records WHERE patient_id = ? ORDER BY created_at DESC', [pid]);
    const voiceRecords = voiceRes.rows.map(vr => ({
      id: vr.id,
      detectedLanguage: vr.detected_language,
      transcript: vr.transcript,
      translatedText: vr.translated_text,
      aiSummary: vr.ai_summary,
      urgency: vr.urgency,
      createdBy: vr.created_by,
      date: vr.created_at ? vr.created_at.split('T')[0].split(' ')[0] : 'Today',
    }));

    return NextResponse.json({
      patient: {
        ...patient,
        id: patient.patient_id,
        conditions: patient.conditions ? (typeof patient.conditions === 'string' ? JSON.parse(patient.conditions) : patient.conditions) : [],
        allergies: patient.allergies ? (typeof patient.allergies === 'string' ? JSON.parse(patient.allergies) : patient.allergies) : [],
        isPregnant: Boolean(patient.is_pregnant),
        pregnancyWeek: patient.pregnancy_week,
        bloodGroup: patient.blood_group,
        registeredDate: patient.created_at ? patient.created_at.split('T')[0].split(' ')[0] : 'Today',
        vitals,
        medications,
        prescriptions,
        visits,
        tickets,
        referrals,
        followups,
        voiceRecords,
        reports: [],
      }
    });

  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve patient profile' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const patientId = params.id;
    const body = await request.json();
    const {
      name,
      age,
      gender,
      village,
      phone,
      bloodGroup,
      isPregnant,
      pregnancyWeek,
      edd,
      conditions,
      allergies,
      address,
      emergencyContact,
      updatedBy,
    } = body;

    const existing = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    await query(
      `UPDATE patients SET
        name = COALESCE(?, name),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        village = COALESCE(?, village),
        phone = COALESCE(?, phone),
        blood_group = COALESCE(?, blood_group),
        is_pregnant = COALESCE(?, is_pregnant),
        pregnancy_week = ?,
        edd = ?,
        conditions = COALESCE(?, conditions),
        allergies = COALESCE(?, allergies),
        address = COALESCE(?, address),
        emergency_contact = COALESCE(?, emergency_contact),
        updated_at = ?
       WHERE patient_id = ? OR id = ?`,
      [
        name,
        age ? parseInt(age) : null,
        gender,
        village,
        phone,
        bloodGroup,
        isPregnant !== undefined ? (isPregnant ? 1 : 0) : null,
        pregnancyWeek !== undefined ? parseInt(pregnancyWeek) : null,
        edd,
        conditions ? JSON.stringify(conditions) : null,
        allergies ? JSON.stringify(allergies) : null,
        address,
        emergencyContact,
        todayStr,
        patientId,
        patientId,
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [updatedBy || 'Staff', 'staff', 'UPDATE_PATIENT', 'patients', patientId, `Updated demographics for patient ${patientId}`]
    );

    return NextResponse.json({ success: true, message: 'Patient details updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient record' }, { status: 500 });
  }
}
