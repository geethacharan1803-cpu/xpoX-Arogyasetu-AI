import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, username, email } = body;

    let user = null;
    if (role) {
      user = await queryOne('SELECT * FROM users WHERE role = ? AND status = ? LIMIT 1', [role, 'active']);
    } else if (username || email) {
      const identifier = username || email;
      user = await queryOne('SELECT * FROM users WHERE (email_or_username = ? OR phone = ?) AND status = ? LIMIT 1', [identifier, identifier, 'active']);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found or invalid credentials' }, { status: 404 });
    }

    // Log the login in audit_logs
    await query(
      `INSERT INTO audit_logs (user_id, user_role, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.role, 'USER_LOGIN', 'users', user.id, `User ${user.name} logged in with role ${user.role}`]
    );

    const userData = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email_or_username,
      phone: user.phone,
      phc: user.phc,
      area: user.area,
      patientId: user.patient_id,
    };

    // Generate lightweight session token (base64 encoded user info for API auth)
    let sessionToken = null;
    try {
      sessionToken = Buffer.from(JSON.stringify({
        id: user.id,
        role: user.role,
        name: user.name,
        patientId: user.patient_id || null,
      })).toString('base64');
    } catch {
      // Buffer may not be available in edge runtime
    }

    return NextResponse.json({
      success: true,
      user: userData,
      sessionToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed. Please try again.' }, { status: 500 });
  }
}
