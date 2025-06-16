'use client';

import React from 'react';
import { Typography, Button, Space } from 'antd';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function OrderConfirmationPage() {
  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <Title level={2} className="text-green-600 mb-4">
        Đặt hàng thành công!
      </Title>
      <Text className="text-lg mb-2">
        Cảm ơn bạn đã đặt hàng.
      </Text>
      
      <Text className="text-gray-600 mb-8">
        Một email xác nhận đơn hàng đã được gửi đến bạn. Vui lòng kiểm tra hộp thư đến.
      </Text>

      <Space size="large">
        <Link href="/tai-khoan?p=history" passHref>
          <Button type="primary" size="large">
            Xem đơn hàng của tôi
          </Button>
        </Link>
        <Link href="/san-pham" passHref>
          <Button size="large">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </Space>
    </div>
  );
}