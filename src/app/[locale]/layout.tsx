// app/[locale]/layout.tsx
'use client';
import I18nProvider from '@/components/I18nProvider';
import { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LocaleProvider } from '@/context/LocaleContext';
import { useConfigOne } from '@/hooks/config/useConfigOne';
import { usePathname } from 'next/navigation'; // Import usePathname
import { AuthProvider } from '@/context/AuthContext';

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const pathname = usePathname(); // Lấy pathname hiện tại
  const { data: configData, isLoading, isError } = useConfigOne();

  // Kiểm tra nếu đường dẫn hiện tại là trang admin
  const isAdminPage = pathname.includes('/admin');

  // Nếu đang tải cấu hình, bạn có thể hiển thị một spinner hoặc null
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        {/* Có thể thêm spinner hoặc placeholder nếu cần */}
        <div>Loading configuration...</div>
      </div>
    );
  }

  // Nếu có lỗi khi tải cấu hình, bạn có thể hiển thị thông báo lỗi
  if (isError) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center text-red-500">
        Error loading configuration.
      </div>
    );
  }

  return (
    <LocaleProvider>
      <I18nProvider locale={params.locale}>
        <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {/* Chỉ hiển thị Header nếu không phải trang admin và có configData */}
          {!isAdminPage && configData && <Header config={configData} />}

          <main className="flex justify-center flex-grow"> {/* Thêm flex-grow để main chiếm hết không gian còn lại */}
            {children}
          </main>

          {/* Chỉ hiển thị Footer nếu không phải trang admin và có configData */}
          {!isAdminPage && configData && <Footer config={configData} />}
        </div>
        </AuthProvider>
      </I18nProvider>
    </LocaleProvider>
  );
}