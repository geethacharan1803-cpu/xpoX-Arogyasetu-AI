import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    let sql = 'SELECT * FROM prescriptions WHERE 1=1';
    const params = [];

    if (patientId) {
      sql += ' AND patient_id = ?';
      params.push(patientId);
    }
    if (doctorId) {
      sql += ' AND doctor_id = ?';
      params.push(doctorId);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    const prescriptions = [];
    for (const rx of result.rows) {
      const items = await query('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.prescription_id]);
      prescriptions.push({
        ...rx,
        medicines: items.rows,
      });
    }

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to retrieve prescriptions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patientId,
      doctorId,
      doctorName,
      medicines,
      notes,
      teluguInstructions,
      hindiInstructions,
      englishInstructions,
    } = body;

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json({ error: 'Patient and valid medicines list are required' }, { status: 400 });
    }

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const pid = patient.patient_id;
    const countRes = await queryOne('SELECT COUNT(*) as count FROM prescriptions');
    const rxIndex = parseInt(countRes?.count || 0) + 1;
    const prescriptionId = `RX-${pid}-${rxIndex}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Insert Prescription
    await query(
      `INSERT INTO prescriptions (
        id, prescription_id, patient_id, doctor_id, doctor_name, prescription_date,
        prescription_status, notes, telugu_instructions, hindi_instructions, english_instructions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prescriptionId,
        prescriptionId,
        pid,
        doctorId || 'U-002',
        doctorName || 'Dr. Sharma',
        todayStr,
        'authorized',
        notes || 'Take as directed.',
        teluguInstructions || null,
        hindiInstructions || null,
        englishInstructions || null,
        todayStr
      ]
    );

    // 2. Insert Prescription Items & update Medications table
    for (const med of medicines) {
      if (!med.name || !med.name.trim()) continue;

      await query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dose, frequency, duration)
         VALUES (?, ?, ?, ?, ?)`,
        [prescriptionId, med.name.trim(), med.dosage || '', med.frequency || '', med.duration || '']
      );

      // Add to patient active medications
      await query(
        `INSERT INTO medications (
          patient_id, medicine_name, dose, frequency, duration, start_date, prescribing_doctor, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pid,
          med.name.trim(),
          med.dosage || '',
          med.frequency || '',
          med.duration || '',
          todayStr,
          doctorName || 'Dr. Sharma',
          'CURRENT',
          todayStr
        ]
      );
    }

    // 3. Record Visit
    await query(
      `INSERT INTO hospital_visits (patient_id, facility_name, visit_date, visit_type, doctor, notes, assessment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid,
        'PHC Rampur',
        todayStr,
        'Doctor Review',
        doctorName || 'Dr. Sharma',
        notes || 'Clinical consultation and medication prescribed.',
        `Prescription authorized: ${prescriptionId}`,
        todayStr
      ]
    );

    // 4. Record Audit Log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        doctorName || 'Dr. Sharma',
        'doctor',
        'AUTHORIZE_PRESCRIPTION',
        'prescriptions',
        prescriptionId,
        `Doctor authorized prescription ${prescriptionId} for patient ${pid}`
      ]
    );

    return NextResponse.json({
      success: true,
      prescriptionId,
      message: 'Prescription authorized and saved to patient record',
    }, { status: 201 });

  } catch (error) {
    console.error('Error authorizing prescription:', error);
    return NextResponse.json({ error: 'Failed to authorize prescription in database' }, { status: 500 });
  }
}
