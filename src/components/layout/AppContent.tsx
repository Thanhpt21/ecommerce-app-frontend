// src/components/layout/AppContent.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useConfigOne } from '@/hooks/config/useConfigOne';
import { AuthProvider } from '@/context/AuthContext';

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();
  const { data: configData, isLoading, isError } = useConfigOne();

  const isAdminPage = pathname.includes('/admin');

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div>Đang tải cấu hình...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center text-red-500">
        Lỗi khi tải cấu hình.
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isAdminPage && configData && <Header config={configData} />}

        <main className="flex justify-center flex-grow">
          {children}
        </main>

        {!isAdminPage && configData && <Footer config={configData} />}
      </div>
    </AuthProvider>
  );
}