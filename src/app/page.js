'use client';

import dynamic from 'next/dynamic';
import Providers from './providers';

const ClientLayout = dynamic(() => import('./client-layout'), { ssr: false });

function RedirectHome() {
  // Dynamically imported to avoid SSR issues
  const { useAuth } = require('@/lib/auth-context');
  const { useRouter } = require('next/navigation');
  const { useEffect } = require('react');

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const routes = {
        asha: '/asha/dashboard',
        doctor: '/doctor/dashboard',
        patient: '/patient/home',
        admin: '/admin/dashboard',
      };
      router.replace(routes[user.role] || '/asha/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading...</span>
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
