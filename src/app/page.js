'use client';

import dynamic from 'next/dynamic';
import { useAuth, getDashboardForRole } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ClientLayout = dynamic(() => import('./client-layout'), { ssr: false });

function RedirectHome() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const target = getDashboardForRole(user.role);
      router.replace(target);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading ArogyaSetu AI...</span>
      </div>
    );
  }

  return null;
}

export default function Page() {
  return (
    <ClientLayout>
      <RedirectHome />
    </ClientLayout>
  );
}
