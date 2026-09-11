import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const patientId = params.id;
    const res = await query(
      'SELECT * FROM hospital_visits WHERE patient_id = ? ORDER BY visit_date DESC',
      [patientId]
    );

    return NextResponse.json({ visits: res.rows });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Failed to retrieve hospital visits' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const patientId = params.id;
    const body = await request.json();
    const {
      facilityName,
      visitDate,
      visitType,
      reason,
      doctor,
      assessment,
      notes,
    } = body;

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO hospital_visits (
        patient_id, facility_name, visit_date, visit_type, reason, doctor, assessment, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient.patient_id,
        facilityName || 'PHC Rampur',
        visitDate || todayStr,
        visitType || 'Clinical Review',
        reason || 'Consultation',
        doctor || 'Medical Officer',
        assessment || null,
        notes || null,
        todayStr
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [doctor || 'Medical Officer', 'doctor', 'RECORD_HOSPITAL_VISIT', 'hospital_visits', patient.patient_id, `Recorded visit at ${facilityName || 'PHC Rampur'}`]
    );

    return NextResponse.json({ success: true, message: 'Hospital visit recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error recording hospital visit:', error);
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
  }
}
