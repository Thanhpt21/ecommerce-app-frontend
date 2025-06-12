// app/[locale]/(auth)/register/page.tsx
'use client'

import { useTranslation } from 'react-i18next'
import { useRegister } from '@/hooks/auth/useRegister'

// Import Ant Design components
import { Form, Input, Button, Card, message } from 'antd' // Bỏ Controller
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'

// Bỏ Zod schema và type RegisterFormValues dựa trên Zod

export default function RegisterPage() {
  const { t } = useTranslation('common');
  const { mutate: registerUser, isPending } = useRegister();
  const locale = useLocale();
  const router = useRouter();

  // Sử dụng Ant Design Form instance
  const [form] = Form.useForm(); // Lấy form instance từ Ant Design

  const onSubmit = async (values: any) => { // values sẽ là object từ Ant Design Form
    // Ant Design Form sẽ tự động validate dựa trên 'rules'
    // Nếu validation pass, onFinish sẽ được gọi
    const { name, email, password } = values;

    registerUser({ name, email, password }, {
      onSuccess: () => {
        message.success(t('register_success', { defaultValue: 'Đăng ký thành công!' }));
        router.push(`/${locale}/login`);
      },
      onError: (error) => {
        message.error(t('register_error', { defaultValue: error.message || 'Đăng ký thất bại!' }));
      },
    });
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
          <h2 className="text-center text-3xl font-bold mb-4">{t('register', { defaultValue: 'Đăng ký' })}</h2>
          <p className="text-center text-base text-muted-foreground mb-6">
            {t('register_subtitle', { defaultValue: 'Điền thông tin của bạn để tạo tài khoản' })}
          </p>

          <Form
            form={form} // Gắn form instance
            layout="vertical"
            onFinish={onSubmit} // onFinish của Ant Design Form
            className="space-y-4"
          >
            {/* Tên */}
            <Form.Item
              name="name" // Cần prop 'name' để Ant Design quản lý giá trị
              label={t('name', { defaultValue: 'Tên của bạn' })}
              rules={[
                { required: true, message: 'Tên không được để trống' },
                { min: 2, message: 'Tên ít nhất 2 ký tự' },
              ]}
            >
              <Input
                placeholder={t('your_name_placeholder', { defaultValue: 'Nhập tên của bạn' })}
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label={t('email', { defaultValue: 'Email' })}
              rules={[
                { required: true, message: 'Email không được để trống' },
                { type: 'email', message: 'Email không hợp lệ' }, // Validation type email
              ]}
            >
              <Input
                type="email"
                placeholder="you@example.com"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            {/* Mật khẩu */}
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

            {/* Xác nhận mật khẩu */}
            <Form.Item
              name="confirmPassword"
              label={t('confirm_password', { defaultValue: 'Xác nhận mật khẩu' })}
              dependencies={['password']} // dependencies để kích hoạt validation khi password thay đổi
              rules={[
                { required: true, message: 'Xác nhận mật khẩu không được để trống' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu và xác nhận mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            {/* Nút Đăng ký */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                {t('register', { defaultValue: 'Đăng ký' })}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-sm text-center text-muted-foreground mt-4">
            {t('have_account', { defaultValue: 'Đã có tài khoản?' })}{' '}
            <Link href={`/${locale}/login`} className="underline hover:text-blue-600 text-blue-500 transition-colors duration-200">
              {t('login_now', { defaultValue: 'Đăng nhập ngay' })}
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