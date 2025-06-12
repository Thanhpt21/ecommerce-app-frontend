// app/[locale]/(auth)/google/callback/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
// Import context hoặc hook quản lý trạng thái đăng nhập của bạn
// Ví dụ: import { useAuthContext } from '@/context/AuthContext';
// Nếu bạn có AuthContext với một hàm để làm mới thông tin user (ví dụ: refetchUser hoặc checkAuthStatus)
// hãy uncomment và sử dụng nó.

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const locale = useLocale();
  // const { refetchUser } = useAuthContext(); // Ví dụ: uncomment nếu bạn có AuthContext

  useEffect(() => {
    // Khi trang này được tải, nghĩa là backend đã xử lý xong và đã đặt cookie `accessToken`.
    // Frontend chỉ cần xác nhận và điều hướng.
    message.success(t('login_success_google', { defaultValue: 'Đăng nhập với Google thành công!' }));

    // Trong ứng dụng thực tế, bạn sẽ muốn kiểm tra trạng thái đăng nhập chính xác hơn
    // và điều hướng người dùng dựa trên vai trò của họ.
    // Ví dụ: gọi API /auth/current để lấy thông tin user mới nhất
    // hoặc sử dụng context để cập nhật trạng thái.

    // Nếu bạn có refetchUser hoặc checkAuthStatus trong AuthContext:
    // if (refetchUser) {
    //   refetchUser().then(user => {
    //     if (user?.role === 'ADMIN') {
    //       router.push(`/${locale}/admin`);
    //     } else {
    //       router.push(`/${locale}/dashboard`); // Hoặc trang chủ mặc định
    //     }
    //   }).catch(() => {
    //     message.error(t('error_fetching_user_info', { defaultValue: 'Lỗi lấy thông tin người dùng.' }));
    //     router.push(`/${locale}/login`);
    //   });
    // } else {
    //   // Nếu không có AuthContext hoặc refetchUser, chỉ đơn giản điều hướng
      router.push(`/${locale}/dashboard`); // Hoặc trang chủ mặc định
    // }

  }, [router, locale, t]); // refetchUser nếu bạn uncomment nó

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="shadow-xl rounded-2xl p-6 md:p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('processing_google_login', { defaultValue: 'Đang xử lý đăng nhập Google...' })}</h2>
        <p className="text-muted-foreground">{t('please_wait', { defaultValue: 'Vui lòng chờ trong giây lát.' })}</p>
      </Card>
    </div>
  );
}