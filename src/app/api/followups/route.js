import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM followups WHERE 1=1';
    const params = [];

    if (patientId) {
      sql += ' AND patient_id = ?';
      params.push(patientId);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY followup_date ASC';
    const result = await query(sql, params);

    const followups = result.rows.map(f => ({
      id: f.followup_id || f.id,
      patientId: f.patient_id,
      patientName: f.patient_name,
      reason: f.reason,
      dueDate: f.followup_date,
      status: f.status,
      type: f.followup_type,
      assignedTo: f.assigned_to,
      notes: f.notes,
    }));

    return NextResponse.json({ followups });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json({ error: 'Failed to retrieve follow-ups' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patientId,
      patientName,
      reason,
      dueDate,
      type,
      assignedTo,
      notes,
    } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Follow-up reason is required' }, { status: 400 });
    }

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    const pid = patient ? patient.patient_id : (patientId || 'P-2026-001');
    const pName = patient ? patient.name : (patientName || 'Registered Patient');

    const countRes = await queryOne('SELECT COUNT(*) as count FROM followups');
    const nextNum = parseInt(countRes?.count || 0) + 1;
    const followupId = `FU-${String(nextNum).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO followups (
        id, followup_id, patient_id, patient_name, assigned_to, reason, followup_date, followup_type, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        followupId,
        followupId,
        pid,
        pName,
        assignedTo || 'ASHA Priya',
        reason.trim(),
        dueDate || todayStr,
        type || 'Follow-up',
        'upcoming',
        notes || null,
        todayStr
      ]
    );

    return NextResponse.json({
      success: true,
      followupId,
      message: 'Follow-up scheduled successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    return NextResponse.json({ error: 'Failed to schedule follow-up' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Follow-up ID and status are required' }, { status: 400 });
    }

    await query('UPDATE followups SET status = ? WHERE followup_id = ? OR id = ?', [status, id, id]);
    return NextResponse.json({ success: true, message: `Follow-up status updated to ${status}` });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json({ error: 'Failed to update follow-up' }, { status: 500 });
  }
}
