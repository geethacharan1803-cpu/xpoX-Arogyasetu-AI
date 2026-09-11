'use client';
import dynamic from 'next/dynamic';
import RoleGuard from '@/components/RoleGuard';

const ClientLayout = dynamic(() => import('@/app/client-layout'), { ssr: false });

export default function PatientLayout({ children }) {
  return (
    <ClientLayout>
      <RoleGuard allowedRoles={['patient', 'admin']}>
        {children}
      </RoleGuard>
    </ClientLayout>
  );
}
