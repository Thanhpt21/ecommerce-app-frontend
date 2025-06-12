// app/[locale]/(auth)/reset-password/page.tsx
'use client'

import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Card, message } from 'antd'; // Bỏ Controller
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import { useEffect, useState } from 'react';

// Bỏ các import liên quan đến zod và react-hook-form
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useForm, Controller } from 'react-hook-form';


// Định nghĩa kiểu dữ liệu cho form values trực tiếp
interface ResetPasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

export default function ResetPasswordPage() {
  const { t } = useTranslation('common');
  const resetPasswordMutation = useResetPassword();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  // Sử dụng hook của Ant Design để lấy instance của form
  const [form] = Form.useForm<ResetPasswordFormValues>(); // Khai báo form instance và kiểu dữ liệu

  // Extract token from URL on component mount
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      message.error(t('invalid_reset_link', { defaultValue: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc bị thiếu.' }));
      router.push(`/${locale}/login`);
    }
  }, [searchParams, locale, router, t]);

  // Ant Design Form sẽ gọi onFinish với values đã validate nếu không có lỗi
  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) {
      message.error(t('token_missing_error', { defaultValue: 'Không tìm thấy mã token đặt lại mật khẩu.' }));
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword: values.newPassword }, {
      onSuccess: () => {
        message.success(t('password_reset_success', { defaultValue: 'Mật khẩu của bạn đã được đặt lại thành công!' }));
        router.push(`/${locale}/login`);
      },
      onError: (error) => {
        message.error(t('password_reset_error', { defaultValue: error.message || 'Không thể đặt lại mật khẩu.' }));
      },
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <p className="text-lg text-red-500">{t('loading_or_invalid_token', { defaultValue: 'Đang tải hoặc liên kết không hợp lệ...' })}</p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">{t('reset_password', { defaultValue: 'Đặt lại mật khẩu' })}</h1>
            <p className="text-muted-foreground text-base mt-2">
              {t('reset_password_subtitle', { defaultValue: 'Vui lòng nhập mật khẩu mới của bạn' })}
            </p>
          </div>

          <Form
            form={form} // Gắn instance form vào component Form
            layout="vertical"
            onFinish={onSubmit} // Ant Design Form sẽ gọi onFinish với các giá trị hợp lệ
            className="space-y-4"
          >
            {/* New Password Field */}
            <Form.Item
              name="newPassword" // Cần prop `name` để Ant Design quản lý giá trị và validation
              label={t('new_password', { defaultValue: 'Mật khẩu mới' })}
              rules={[
                { required: true, message: 'Mật khẩu mới không được để trống' },
                { min: 6, message: 'Mật khẩu mới ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            {/* Confirm New Password Field */}
            <Form.Item
              name="confirmNewPassword" // Cần prop `name`
              label={t('confirm_new_password', { defaultValue: 'Xác nhận mật khẩu mới' })}
              dependencies={['newPassword']} // Đảm bảo validation chạy lại khi newPassword thay đổi
              rules={[
                { required: true, message: 'Xác nhận mật khẩu mới không được để trống' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu mới và xác nhận mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                {t('reset_password_button', { defaultValue: 'Đặt lại mật khẩu' })}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-sm text-center text-muted-foreground mt-4">
            <Link href={`/${locale}/login`} className="underline hover:text-blue-600 text-blue-500">
              ← {t('back_to_login', { defaultValue: 'Quay lại Đăng nhập' })}
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