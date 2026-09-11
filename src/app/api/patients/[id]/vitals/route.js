import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const patientId = params.id;
    const res = await query(
      'SELECT * FROM patient_vitals WHERE patient_id = ? ORDER BY recorded_at DESC',
      [patientId]
    );

    const vitals = res.rows.map(v => ({
      id: v.id,
      date: v.recorded_at ? v.recorded_at.split('T')[0].split(' ')[0] : 'Recorded',
      bp: v.blood_pressure,
      pulse: v.pulse,
      temp: v.temperature,
      weight: v.weight,
      spo2: v.spo2,
      sugar: v.blood_sugar,
      hemoglobin: v.hemoglobin,
      recordedBy: v.recorded_by,
    }));

    return NextResponse.json({ vitals });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return NextResponse.json({ error: 'Failed to retrieve vitals' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const patientId = params.id;
    const body = await request.json();
    const {
      bp,
      pulse,
      temp,
      weight,
      spo2,
      sugar,
      hemoglobin,
      recordedBy,
    } = body;

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const pid = patient.patient_id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Non-destructive addition of new vitals record
    await query(
      `INSERT INTO patient_vitals (
        patient_id, recorded_by, blood_pressure, pulse, temperature, weight, spo2, blood_sugar, hemoglobin, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid,
        recordedBy || 'ASHA Worker',
        bp || null,
        pulse ? parseInt(pulse) : null,
        temp ? parseFloat(temp) : null,
        weight ? parseFloat(weight) : null,
        spo2 ? parseInt(spo2) : null,
        sugar ? parseInt(sugar) : null,
        hemoglobin ? parseFloat(hemoglobin) : null,
        todayStr
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recordedBy || 'ASHA Worker', 'asha', 'RECORD_VITALS', 'patients', pid, `Recorded vitals: BP ${bp || 'N/A'}, Pulse ${pulse || 'N/A'}`]
    );

    return NextResponse.json({ success: true, message: 'Vitals recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error recording vitals:', error);
    return NextResponse.json({ error: 'Failed to record vitals' }, { status: 500 });
  }
}
