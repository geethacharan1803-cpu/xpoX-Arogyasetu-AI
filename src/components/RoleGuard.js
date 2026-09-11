'use client';

import { useAuth, getDashboardForRole } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function RoleGuard({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!allowedRoles.includes(user.role)) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Verifying clinical credentials...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    const authorizedDashboard = getDashboardForRole(user.role);

    return (
      <div style={{ padding: 'var(--space-2xl) var(--space-md)', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', borderTop: '4px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={32} />
            </div>
          </div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-danger)', marginBottom: 'var(--space-xs)' }}>
            403 Forbidden
          </h2>
          <p className="font-semibold" style={{ marginBottom: 'var(--space-sm)' }}>
            Access Restricted by Role-Based Access Control (RBAC)
          </p>
          <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
            Your account ({user.name} &mdash; <span className="badge badge-primary">{user.role.toUpperCase()}</span>) is not authorized to access this route (<code>{pathname}</code>).
          </p>
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={() => router.replace(authorizedDashboard)}
          >
            Go to My Authorized Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return children;
}
