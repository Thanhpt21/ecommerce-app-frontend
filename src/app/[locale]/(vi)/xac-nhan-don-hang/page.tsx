// app/[locale]/xac-nhan-don-hang/page.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Space } from 'antd';
import Link from 'next/link';
import { useLocaleContext } from '@/context/LocaleContext';

const { Title, Text } = Typography;

export default function OrderConfirmationPage() {
  const { t } = useTranslation('checkout'); // Hoặc một namespace riêng cho order confirmation
  const { locale } = useLocaleContext();

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <Title level={2} className="text-green-600 mb-4">
        {t('order_placed_successfully')}
      </Title>
      <Text className="text-lg mb-2">
        {t('thank_you_for_your_order')}.
      </Text>
     
      <Text className="text-gray-600 mb-8">
        {t('order_confirmation_email_sent')}. {t('please_check_your_inbox')}.
      </Text>

      <Space size="large">
        <Link href={`/${locale}/tai-khoan?p=history`} passHref>
          <Button type="primary" size="large">
            {t('view_my_orders')}
          </Button>
        </Link>
        <Link href={`/${locale}/san-pham`} passHref>
          <Button size="large">
            {t('continue_shopping')}
          </Button>
        </Link>
      </Space>

      {/* Bạn có thể thêm các thông tin tóm tắt khác ở đây nếu muốn */}
      {/* Ví dụ:
      <div className="mt-8 p-4 border rounded-lg max-w-md mx-auto">
        <Title level={4}>{t('order_summary')}</Title>
        <p>Tổng tiền: {t('currency_symbol')}{totalAmount?.toLocaleString()}</p>
        <p>Phương thức thanh toán: {paymentMethod}</p>
      </div>
      */}
    </div>
  );
}