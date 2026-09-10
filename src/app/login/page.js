'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Users, Stethoscope, User } from 'lucide-react';

const ROLES = [
  { key: 'asha', label: 'ASHA Worker', desc: 'Community health worker', icon: Users },
  { key: 'doctor', label: 'Doctor', desc: 'PHC doctor', icon: Stethoscope },
  { key: 'patient', label: 'Patient', desc: 'Community member', icon: User },
  { key: 'admin', label: 'Admin', desc: 'Administrator', icon: ShieldCheck },
];

export default function LoginPage({ onLogin }) {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('asha');

  const handleLogin = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(selectedRole);
    } else if (login) {
      login(selectedRole);
      const routes = {
        asha: '/asha/dashboard',
        doctor: '/doctor/dashboard',
        patient: '/patient/home',
        admin: '/admin/dashboard',
      };
      router.push(routes[selectedRole] || '/asha/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">ArogyaSetu AI</h1>
        <p className="login-subtitle">
          Rural Healthcare Communication Platform
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select your role to continue</label>
            <div className="role-selector">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.key}
                    className={`role-card ${selectedRole === role.key ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role.key)}
                  >
                    <div className="role-card-icon"><Icon size={28} /></div>
                    <div className="role-card-title">{role.label}</div>
                    <div className="role-card-desc">{role.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full">
            Continue as {ROLES.find(r => r.key === selectedRole)?.label}
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            DEMO MODE — No real credentials required
          </p>
        </form>
      </div>
    </div>
  );
}
