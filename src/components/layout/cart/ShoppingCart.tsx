'use client';

import Image from 'next/image';
import { Table, Button, InputNumber, Space, Breadcrumb, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { CartItem } from '@/types/cart.type';
import { formatVND } from '@/utils/helpers';
import useCart from '@/stores/cartStore';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ShoppingCart = () => {
  const { items: cartItems, removeItem, increaseItemQuantity, decreaseItemQuantity, getTotalPrice, isHydrated } = useCart();
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  if (!isHydrated || authLoading) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id);
  };

  const onChangeQuantity = (value: number | null, item: CartItem) => {
    if (value !== null) {
      const diff = value - item.quantity;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          increaseItemQuantity(item.id);
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          decreaseItemQuantity(item.id);
        }
      }
    }
  };

  const handleCheckoutClick = () => {
    if (!currentUser) {
      setIsLoginModalVisible(true);
    } else {
      router.push(`/thanh-toan`);
    }
  };

  const handleLoginModalOk = () => {
    setIsLoginModalVisible(false);
    const returnUrl = encodeURIComponent(`/gio-hang`);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleLoginModalCancel = () => {
    setIsLoginModalVisible(false);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'thumb',
      key: 'thumb',
      render: (thumb: string, record: CartItem) => (
        <div className="relative w-16 h-16">
          <Image src={thumb} alt={record.title} fill style={{ objectFit: 'cover' }} />
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Màu sắc',
      dataIndex: 'selectedColor',
      key: 'color',
      render: (color: CartItem['selectedColor']) => (
        color && (
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: color.code }}
              title={color.title}
            ></div>
            <span>{color.title}</span>
          </div>
        )
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'selectedSizeTitle',
      key: 'size',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: CartItem) => (
        <InputNumber min={1} defaultValue={quantity} onChange={(value) => onChangeQuantity(value, record)} />
      ),
    },
    {
      title: 'Tổng cộng',
      key: 'totalPrice',
      render: (_:any, record: CartItem) => {
        const price = record.discountedPrice !== undefined ? record.discountedPrice : record.price;
        const totalPriceForItem = price * record.quantity;
        const originalTotalPriceForItem = record.price * record.quantity;
        return (
          <span>
            {record.discountedPrice !== undefined && (
              <span className="line-through text-gray-500 mr-2">{formatVND(originalTotalPriceForItem)}</span>
            )}
            {formatVND(totalPriceForItem)}
          </span>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Button
          icon={<DeleteOutlined />}
          size="small"
          danger
          onClick={() => handleRemoveItem(record)}
        >
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
          <Breadcrumb >
            <Breadcrumb.Item>
              <Link href="/">Trang chủ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Giỏ hàng của bạn</Breadcrumb.Item>
          </Breadcrumb>
      </div>
      {cartItems.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          <Table dataSource={cartItems} columns={columns} rowKey={(record) => `${record.id}-${record.selectedColor?.id}-${record.selectedSizeId}`} pagination={false} />
          <div className="mt-4 flex justify-end items-center">
            <span className="font-semibold text-lg mr-4">Tổng cộng: {formatVND(getTotalPrice())}</span>
            <Button type="primary" size="large" onClick={handleCheckoutClick}>
              Thanh toán
            </Button>
          </div>
        </>
      )}

      <Modal
        title="Yêu cầu đăng nhập"
        visible={isLoginModalVisible}
        onOk={handleLoginModalOk}
        onCancel={handleLoginModalCancel}
        okText="Đăng nhập ngay"
        cancelText="Hủy"
      >
        <p>Bạn cần đăng nhập để tiến hành thanh toán.</p>
      </Modal>
    </div>
  );
};

export default ShoppingCart;