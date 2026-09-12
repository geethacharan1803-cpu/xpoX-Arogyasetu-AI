import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authorizeRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Backend RBAC: Only admin can list all system users
  const auth = authorizeRequest(request, ['admin', 'cmho']);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let sql = 'SELECT id, name, email_or_username, phone, role, status, phc, area, patient_id FROM users WHERE status = ?';
    const params = ['active'];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY name ASC';
    const result = await query(sql, params);

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
