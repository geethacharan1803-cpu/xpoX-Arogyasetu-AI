import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM referrals WHERE 1=1';
    const params = [];

    if (patientId) {
      sql += ' AND patient_id = ?';
      params.push(patientId);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    const referrals = result.rows.map(r => ({
      id: r.referral_id || r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      ticketId: r.health_ticket_id,
      reason: r.reason,
      priority: r.priority,
      destination: r.referred_to,
      createdBy: r.referred_by,
      createdDate: r.created_at ? r.created_at.split('T')[0].split(' ')[0] : 'Today',
      status: r.status,
    }));

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Failed to retrieve referrals' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patientId,
      patientName,
      ticketId,
      reason,
      priority,
      destination,
      createdBy,
    } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Referral reason is required' }, { status: 400 });
    }

    const patient = await queryOne('SELECT * FROM patients WHERE patient_id = ? OR id = ?', [patientId, patientId]);
    const pid = patient ? patient.patient_id : (patientId || 'P-2026-001');
    const pName = patient ? patient.name : (patientName || 'Registered Patient');

    const countRes = await queryOne('SELECT COUNT(*) as count FROM referrals');
    const nextNum = parseInt(countRes?.count || 0) + 1;
    const referralId = `REF-2026-${String(nextNum).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO referrals (
        id, referral_id, patient_id, patient_name, health_ticket_id,
        referred_by, referred_to, reason, priority, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        referralId,
        referralId,
        pid,
        pName,
        ticketId || null,
        createdBy || 'ASHA Priya',
        destination || 'PHC Rampur',
        reason.trim(),
        priority || 'medium',
        'pending',
        todayStr,
        todayStr
      ]
    );

    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [createdBy || 'ASHA Priya', 'asha', 'CREATE_REFERRAL', 'referrals', referralId, `Created referral ${referralId} for ${pName}`]
    );

    return NextResponse.json({
      success: true,
      referralId,
      message: 'Referral created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, updatedBy } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Referral ID and status are required' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    await query(
      'UPDATE referrals SET status = ?, updated_at = ? WHERE referral_id = ? OR id = ?',
      [status, todayStr, id, id]
    );

    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [updatedBy || 'Doctor', 'doctor', 'UPDATE_REFERRAL_STATUS', 'referrals', id, `Updated referral ${id} status to ${status}`]
    );

    return NextResponse.json({ success: true, message: `Referral status updated to ${status}` });
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}
