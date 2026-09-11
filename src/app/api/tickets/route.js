import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM health_tickets WHERE 1=1';
    const params = [];

    if (patientId) {
      sql += ' AND patient_id = ?';
      params.push(patientId);
    }
    if (priority && priority !== 'all') {
      sql += ' AND priority = ?';
      params.push(priority);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    const tickets = result.rows.map(t => ({
      id: t.ticket_number || t.id,
      patientId: t.patient_id,
      patientName: t.patient_name,
      concern: t.concern,
      symptoms: t.symptoms,
      priority: t.priority,
      status: t.status,
      createdDate: t.created_at ? t.created_at.split('T')[0].split(' ')[0] : 'Today',
      createdBy: t.created_by,
      vitals: t.vitals_json ? JSON.parse(t.vitals_json) : null,
      timeline: t.timeline_json ? JSON.parse(t.timeline_json) : [],
      transcript: t.transcript,
      translatedTranscript: t.translated_transcript,
      detectedLanguage: t.detected_language,
    }));

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to retrieve tickets' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patientId,
      concern,
      symptoms,
      priority,
      bp,
      pulse,
      temp,
      spo2,
      sugar,
      transcript,
      translatedTranscript,
      detectedLanguage,
      createdBy,
    } = body;

    if (!concern || !concern.trim()) {
      return NextResponse.json({ error: 'Chief health concern is required' }, { status: 400 });
    }

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    const pid = patient ? patient.patient_id : (patientId || 'P-2026-001');
    const pName = patient ? patient.name : 'Registered Patient';

    const countRes = await queryOne('SELECT COUNT(*) as count FROM health_tickets');
    const nextNum = parseInt(countRes?.count || 0) + 130;
    const ticketId = `HT-2026-000${nextNum}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const vitalsObj = {
      bp: bp || '120/80',
      pulse: parseInt(pulse) || 76,
      temp: parseFloat(temp) || 98.6,
      weight: 60,
      spo2: parseInt(spo2) || 98,
      sugar: sugar ? parseInt(sugar) : null,
    };

    const timeline = [
      { step: 'Registered', date: todayStr, completed: true, note: 'Health ticket created' },
      { step: 'Symptoms Recorded', date: todayStr, completed: true, note: symptoms || concern },
      { step: 'Vitals Added', date: todayStr, completed: true, note: `BP ${vitalsObj.bp}, Pulse ${vitalsObj.pulse}, SpO2 ${vitalsObj.spo2}%` },
      { step: 'Referred', date: null, completed: false, note: '' },
      { step: 'Doctor Reviewed', date: null, completed: false, note: '' },
      { step: 'Prescription Added', date: null, completed: false, note: '' },
      { step: 'Follow-up Scheduled', date: null, completed: false, note: '' },
    ];

    await query(
      `INSERT INTO health_tickets (
        id, ticket_number, patient_id, patient_name, concern, symptoms,
        vitals_json, timeline_json, transcript, translated_transcript,
        detected_language, priority, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketId,
        ticketId,
        pid,
        pName,
        concern.trim(),
        symptoms || concern.trim(),
        JSON.stringify(vitalsObj),
        JSON.stringify(timeline),
        transcript || null,
        translatedTranscript || null,
        detectedLanguage || 'English',
        priority || 'medium',
        'vitals-added',
        createdBy || 'ASHA Priya',
        todayStr,
        todayStr
      ]
    );

    // Save vitals into patient vitals table too
    await query(
      `INSERT INTO patient_vitals (
        patient_id, recorded_by, blood_pressure, pulse, temperature, weight, spo2, blood_sugar, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid,
        createdBy || 'ASHA Priya',
        vitalsObj.bp,
        vitalsObj.pulse,
        vitalsObj.temp,
        vitalsObj.weight,
        vitalsObj.spo2,
        vitalsObj.sugar,
        todayStr
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [createdBy || 'ASHA Priya', 'asha', 'CREATE_HEALTH_TICKET', 'health_tickets', ticketId, `Created health ticket ${ticketId} for ${pName}`]
    );

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketId,
        patientId: pid,
        patientName: pName,
        concern,
        priority: priority || 'medium',
        status: 'vitals-added',
        createdDate: todayStr,
        vitals: vitalsObj,
        timeline,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating health ticket:', error);
    return NextResponse.json({ error: 'Failed to create health ticket' }, { status: 500 });
  }
}
