'use client';
import dynamic from 'next/dynamic';
import RoleGuard from '@/components/RoleGuard';

const ClientLayout = dynamic(() => import('@/app/client-layout'), { ssr: false });

export default function DoctorLayout({ children }) {
  return (
    <ClientLayout>
      <RoleGuard allowedRoles={['doctor', 'medical_officer', 'bmo', 'cmho', 'admin']}>
        {children}
      </RoleGuard>
    </ClientLayout>
  );
}
