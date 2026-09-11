'use client';
import dynamic from 'next/dynamic';
import RoleGuard from '@/components/RoleGuard';

const ClientLayout = dynamic(() => import('@/app/client-layout'), { ssr: false });

export default function AshaLayout({ children }) {
  return (
    <ClientLayout>
      <RoleGuard allowedRoles={['asha', 'anm', 'cho', 'admin']}>
        {children}
      </RoleGuard>
    </ClientLayout>
  );
}
