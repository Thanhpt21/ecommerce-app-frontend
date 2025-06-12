'use client';

import '@/styles/globals.css';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient(); // Khởi tạo QueryClient một lần duy nhất

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Bọc toàn bộ ứng dụng trong QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          {children} {/* children ở đây sẽ là LocaleLayout từ app/[locale]/layout.tsx */}
        </QueryClientProvider>
      </body>
    </html>
  );
}