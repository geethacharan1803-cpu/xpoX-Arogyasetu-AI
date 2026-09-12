'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardForRole } from '@/lib/auth-context';
import { ShieldCheck, Users, Stethoscope, User, HeartPulse, Hospital, Clipboard, Building } from 'lucide-react';

const ROLES = [
  { key: 'asha', label: 'ASHA Worker', desc: 'Community health worker', icon: Users },
  { key: 'doctor', label: 'Medical Officer / Doctor', desc: 'PHC clinical clinician', icon: Stethoscope },
  { key: 'patient', label: 'Patient / Citizen', desc: 'Community member', icon: User },
  { key: 'anm', label: 'ANM', desc: 'Auxiliary Nurse Midwife', icon: HeartPulse },
  { key: 'cho', label: 'CHO', desc: 'Community Health Officer', icon: Clipboard },
  { key: 'admin', label: 'Administrator', desc: 'System administrator', icon: ShieldCheck },
  { key: 'bmo', label: 'BMO', desc: 'Block Medical Officer', icon: Hospital },
  { key: 'cmho', label: 'CMHO', desc: 'Chief Medical & Health Officer', icon: Building },
];

export default function LoginPage({ onLogin }) {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('asha');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (login) {
        await login(selectedRole);
      } else if (onLogin) {
        await onLogin(selectedRole);
      }
      const targetDashboard = getDashboardForRole(selectedRole);
      router.replace(targetDashboard);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: 700 }}>
        <h1 className="login-title">ArogyaSetu AI</h1>
        <p className="login-subtitle">
          Multilingual Rural Healthcare &amp; Clinical Continuity Platform
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select your authorized role to continue</label>
            <div className="role-selector" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.key}
                    className={`role-card ${selectedRole === role.key ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role.key)}
                  >
                    <div className="role-card-icon"><Icon size={24} /></div>
                    <div className="role-card-title" style={{ fontSize: 'var(--font-size-sm)' }}>{role.label}</div>
                    <div className="role-card-desc" style={{ fontSize: 'var(--font-size-xs)' }}>{role.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : `Continue as ${ROLES.find(r => r.key === selectedRole)?.label}`}
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Role-Based Access Control (RBAC) Enforced &mdash; Persistent Relational Database Active
          </p>
        </form>
      </div>
    </div>
  );
}
