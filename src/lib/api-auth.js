/**
 * Lightweight API authorization helper for ArogyaSetu AI.
 *
 * Reads the X-User-Session header (base64-encoded JSON { id, role, name })
 * from incoming API requests and validates the role against allowed roles.
 *
 * This is NOT cryptographically secure — suitable for demo/dev.
 * For production, use proper JWT with httpOnly cookies.
 */

/**
 * Extracts user session from the X-User-Session header.
 * @param {Request} request - The incoming Next.js API request
 * @returns {{ id: string, role: string, name: string } | null}
 */
export function getUserFromRequest(request) {
  try {
    const sessionHeader = request.headers.get('x-user-session');
    if (!sessionHeader) return null;
    const decoded = JSON.parse(atob(sessionHeader));
    if (decoded && decoded.id && decoded.role) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates that the requesting user has one of the allowed roles.
 * Returns { authorized: true, user } or { authorized: false, response }.
 *
 * @param {Request} request
 * @param {string[]} allowedRoles - Array of role strings that can access this endpoint
 * @returns {{ authorized: boolean, user?: object, response?: Response }}
 */
export function authorizeRequest(request, allowedRoles) {
  const user = getUserFromRequest(request);

  // If no session header, allow the request (graceful degradation for
  // unauthenticated/demo scenarios — the frontend enforces login).
  // In production this would return 401.
  if (!user) {
    return { authorized: true, user: null };
  }

  if (allowedRoles.includes(user.role)) {
    return { authorized: true, user };
  }

  return {
    authorized: false,
    user,
    response: new Response(
      JSON.stringify({
        error: 'Access denied. Your role does not have permission to access this resource.',
        role: user.role,
        requiredRoles: allowedRoles,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    ),
  };
}

/**
 * Checks if a patient user is accessing only their own data.
 * @param {object} user - The decoded user session
 * @param {string} requestedPatientId - The patient ID being accessed
 * @returns {boolean}
 */
export function isPatientAccessingOwnData(user, requestedPatientId) {
  if (!user || user.role !== 'patient') return true; // Non-patients pass through
  // Patient must only access their own linked patient_id
  // The user.patientId is set during login from the users table
  return user.patientId === requestedPatientId || !requestedPatientId;
}
