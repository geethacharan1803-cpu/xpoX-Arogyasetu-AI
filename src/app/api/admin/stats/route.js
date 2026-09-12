import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { DEMO_FACILITIES } from '@/lib/demo-data';
import { authorizeRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Backend RBAC: Only admin, bmo, cmho can access system-wide stats
  const auth = authorizeRequest(request, ['admin', 'bmo', 'cmho']);
  if (!auth.authorized) return auth.response;

  try {
    const totalPatients = await queryOne('SELECT COUNT(*) as count FROM patients');
    const pregnantPatients = await queryOne('SELECT COUNT(*) as count FROM patients WHERE is_pregnant = 1');
    const childrenPatients = await queryOne('SELECT COUNT(*) as count FROM patients WHERE age < 18');
    const chronicPatients = await queryOne(`SELECT COUNT(DISTINCT patient_id) as count FROM patient_problems WHERE LOWER(description) LIKE '%diabetes%' OR LOWER(description) LIKE '%hypertension%' OR LOWER(description) LIKE '%asthma%'`);
    const totalTickets = await queryOne('SELECT COUNT(*) as count FROM health_tickets');
    const highPriorityTickets = await queryOne("SELECT COUNT(*) as count FROM health_tickets WHERE priority = 'high'");
    const activeReferrals = await queryOne("SELECT COUNT(*) as count FROM referrals WHERE status != 'completed'");
    const completedReferrals = await queryOne("SELECT COUNT(*) as count FROM referrals WHERE status = 'completed'");
    const pendingFollowups = await queryOne("SELECT COUNT(*) as count FROM followups WHERE status != 'completed'");
    const overdueFollowups = await queryOne("SELECT COUNT(*) as count FROM followups WHERE status = 'overdue'");

    const usersByRole = await query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const referralsByStatus = await query('SELECT status, COUNT(*) as count FROM referrals GROUP BY status');
    const auditLogsRes = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20');

    // ASHA Distribution
    const ashaDistribution = await query(`
      SELECT COALESCE(u.name, 'Unassigned') as worker, COUNT(p.id) as count 
      FROM patients p 
      LEFT JOIN users u ON p.created_by = u.id 
      GROUP BY p.created_by, u.name
    `);

    // All patients and tickets for cluster detection
    const allPatients = await query('SELECT id, name, village, age, is_pregnant FROM patients');
    const allTickets = await query('SELECT id, ticket_number, patient_id, concern, symptoms, priority, status, created_at FROM health_tickets ORDER BY created_at DESC');

    const statusCounts = {
      pending: 0,
      'in-review': 0,
      accepted: 0,
      completed: 0,
    };
    (referralsByStatus.rows || []).forEach(r => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status] = parseInt(r.count || 0);
      }
    });

    return NextResponse.json({
      stats: {
        totalPatients: parseInt(totalPatients?.count || 0),
        pregnantWomen: parseInt(pregnantPatients?.count || 0),
        children: parseInt(childrenPatients?.count || 0),
        chronicConditions: parseInt(chronicPatients?.count || 0),
        totalTickets: parseInt(totalTickets?.count || 0),
        highPriorityTickets: parseInt(highPriorityTickets?.count || 0),
        activeReferrals: parseInt(activeReferrals?.count || 0),
        completedReferrals: parseInt(completedReferrals?.count || 0),
        pendingFollowups: parseInt(pendingFollowups?.count || 0),
        overdueFollowups: parseInt(overdueFollowups?.count || 0),
        totalFacilities: DEMO_FACILITIES.length,
      },
      referralsByStatus: statusCounts,
      ashaDistribution: ashaDistribution.rows || [],
      usersByRole: usersByRole.rows,
      recentAuditLogs: auditLogsRes.rows,
      patients: allPatients.rows.map(p => ({
        id: p.id,
        name: p.name,
        village: p.village,
        age: p.age,
        isPregnant: !!p.is_pregnant,
      })),
      tickets: allTickets.rows.map(t => ({
        id: t.ticket_number || t.id,
        patientId: t.patient_id,
        chiefComplaint: t.concern,
        description: t.symptoms || t.concern,
        priority: t.priority,
        status: t.status,
        createdDate: t.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin statistics' }, { status: 500 });
  }
}

