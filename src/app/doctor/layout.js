'use client';
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(() => import('@/app/client-layout'), { ssr: false });

export default function DoctorLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}
