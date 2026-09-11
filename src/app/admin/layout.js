'use client';
import dynamic from 'next/dynamic';
import RoleGuard from '@/components/RoleGuard';

const ClientLayout = dynamic(() => import('@/app/client-layout'), { ssr: false });

export default function AdminLayout({ children }) {
  return (
    <ClientLayout>
      <RoleGuard allowedRoles={['admin', 'bmo', 'cmho']}>
        {children}
      </RoleGuard>
    </ClientLayout>
  );
}
