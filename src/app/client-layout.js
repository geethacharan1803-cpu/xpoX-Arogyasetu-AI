'use client';

import { useAuth } from '@/lib/auth-context';
import LoginPage from './login/page';
import AppShell from '@/components/AppShell';

function AppContent({ children }) {
  const { user, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading ArogyaSetu AI...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return <AppShell>{children}</AppShell>;
}

export default function ClientLayout({ children }) {
  return <AppContent>{children}</AppContent>;
}
