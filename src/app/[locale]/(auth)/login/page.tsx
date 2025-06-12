// app/[locale]/(auth)/login/page.tsx
'use client'

import { useTranslation } from 'react-i18next'
import { useLogin } from '@/hooks/auth/useLogin'
import { useLocale } from '@/hooks/useLocale'

import { Form, Input, Button, Card, message, Divider } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
// import { useGoogleLoginMutation } from '@/hooks/auth/useGoogleLogin'; // <-- KHÔNG CẦN NỮA

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { t } = useTranslation('common');
  const loginMutation = useLogin();
  // const googleLoginMutation = useGoogleLoginMutation(); // <-- KHÔNG CẦN NỮA
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form] = Form.useForm<LoginFormValues>();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        message.success(t('login_success', { defaultValue: 'Đăng nhập thành công!' }));
        const returnUrl = searchParams.get('returnUrl');

        if (returnUrl) {
          // Nếu có returnUrl, điều hướng về trang đó
          router.push(decodeURIComponent(returnUrl)); // Decode URL trước khi chuyển hướng
        } else {
          // Nếu là người dùng thường và không có returnUrl, điều hướng đến trang chủ
          router.push(`/${locale}`);
        }
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        message.error(t('error_login', { defaultValue: errorMessage || 'Đăng nhập thất bại!' }));
      },
    });
  };

  const handleGoogleLogin = () => {
    // Thay vì dùng useMutation, bạn sẽ trực tiếp chuyển hướng trình duyệt
    // đến endpoint khởi tạo Google OAuth của backend.
    // Đảm bảo URL này là URL của backend của bạn (ví dụ: http://localhost:4000)
    // và endpoint là /auth/google
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL; // Lấy từ biến môi trường
    if (backendBaseUrl) {
      const returnUrl = searchParams.get('returnUrl');
     const googleAuthUrl = `${backendBaseUrl}/auth/google`;
      if (returnUrl) {
        window.location.href = `${googleAuthUrl}?returnUrl=${encodeURIComponent(returnUrl)}`;
      } else {
        window.location.href = googleAuthUrl;
      }

    } else {
      message.error(t('error_config', { defaultValue: 'Cấu hình URL backend không tìm thấy.' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="shadow-xl border rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">{t('login', { defaultValue: 'Đăng nhập' })}</h1>
            <p className="text-muted-foreground text-base mt-2">
              {t('login_subtitle', {
                defaultValue: 'Vui lòng nhập thông tin để tiếp tục',
              })}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-4"
          >
            {/* Trường Email */}
            <Form.Item
              name="email"
              label={t('email', { defaultValue: 'Email' })}
              rules={[
                { required: true, message: 'Email không được để trống' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                type="email"
                placeholder="you@example.com"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            {/* Trường Mật khẩu */}
            <Form.Item
              name="password"
              label={t('password', { defaultValue: 'Mật khẩu' })}
              rules={[
                { required: true, message: 'Mật khẩu không được để trống' },
                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            {/* Nút Đăng nhập */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                {t('login', { defaultValue: 'Đăng nhập' })}
              </Button>
            </Form.Item>
          </Form>

          {/* --- Phần Google Login --- */}
          <Divider>{t('or', { defaultValue: 'HOẶC' })}</Divider>
          <Button
            type="default"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            // loading={googleLoginMutation.isPending} // <-- Không cần loading state từ mutation nữa
            className="w-full border-2 border-gray-300 hover:border-blue-500 rounded-md py-2 h-auto text-lg flex items-center justify-center"
          >
            {t('login_with_google', { defaultValue: 'Đăng nhập với Google' })}
          </Button>

          <div className="text-sm text-center text-muted-foreground mt-4">
            <Link href={`/${locale}/forgot-password`} className="underline hover:text-blue-600 text-blue-500 mr-2">
              {t('forgot_password', { defaultValue: 'Quên mật khẩu?' })}
            </Link>
            /
            <Link href={`/${locale}/register`} className="underline hover:text-blue-600 text-blue-500 ml-2">
              {t('register', { defaultValue: 'Đăng ký' })}
            </Link>
          </div>
        </Card>

        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="text-sm text-blue-500 underline hover:text-blue-600 transition-colors duration-150"
          >
            ← {t('back_home', { defaultValue: 'Quay về trang chủ' })}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}