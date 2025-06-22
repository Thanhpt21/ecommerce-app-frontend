'use client';

import React from 'react';
import { Typography, Button, Space } from 'antd';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import dathangthanhcong from '@/assets/banner/dathangthanhcong.jpg';

const { Title, Text } = Typography;

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      {/* Centered Image */}
      <Image
        src={dathangthanhcong}
        alt="Order Completed"
        width={300} // Adjust width as needed
        height={300} // Adjust height as needed, will maintain aspect ratio with 'object-contain'
        className="mb-8 object-contain" // Tailwind classes for margin-bottom and object-fit
      />

      {/* Title */}
      <Title level={3} className="text-green-600 mb-2 !text-3xl md:!text-4xl lg:!text-5xl">
        Đặt hàng thành công!
      </Title>

      {/* Confirmation Messages */}
      <Text className="text-base text-gray-700 mb-2 max-w-lg">
        Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
      </Text>

      <Text className="text-base text-gray-600 mb-8 max-w-lg">
        Một email xác nhận đơn hàng với chi tiết đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra để biết thêm thông tin.
      </Text>

      {/* Action Buttons */}
      <Space size="large" wrap> {/* 'wrap' property helps buttons wrap on smaller screens */}
        <Link href="/tai-khoan?p=history" passHref>
          <Button type="primary" size="large" className="w-full md:w-auto">
            Xem đơn hàng của tôi
          </Button>
        </Link>
        <Link href="/san-pham" passHref>
          <Button size="large" className="w-full md:w-auto">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </Space>
    </div>
  );
}