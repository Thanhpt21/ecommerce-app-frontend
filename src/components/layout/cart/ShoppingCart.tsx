// components/ShoppingCart.js
'use client';

import Image from 'next/image';
import { Table, Button, InputNumber, Space, Breadcrumb, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CartItem } from '@/types/cart.type';
import { formatVND } from '@/utils/helpers';
import useCart from '@/stores/cartStore';
import { useLocaleContext } from '@/context/LocaleContext';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Import useRouter

const ShoppingCart = () => {
  const { locale } = useLocaleContext();
  const { t } = useTranslation('cart');
  const { items: cartItems, removeItem, increaseItemQuantity, decreaseItemQuantity, getTotalPrice, isHydrated } = useCart();
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter(); // Khởi tạo useRouter

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  if (!isHydrated || authLoading) {
    return <div>{t('loading_cart')}...</div>;
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
      router.push(`/${locale}/thanh-toan`); // Sử dụng router.push để điều hướng
    }
  };

  const handleLoginModalOk = () => {
    setIsLoginModalVisible(false);
    // Mã hóa URL hiện tại để truyền qua query parameter
    const returnUrl = encodeURIComponent(`/${locale}/gio-hang`);
    router.push(`/${locale}/login?returnUrl=${returnUrl}`); // Điều hướng đến trang đăng nhập kèm returnUrl
  };

  const handleLoginModalCancel = () => {
    setIsLoginModalVisible(false);
  };

  const columns = [
    {
      title: t('image'),
      dataIndex: 'thumb',
      key: 'thumb',
      render: (thumb: string, record: CartItem) => (
        <div className="relative w-16 h-16">
          <Image src={thumb} alt={record.title} fill style={{ objectFit: 'cover' }} />
        </div>
      ),
    },
    {
      title: t('product'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('color'),
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
      title: t('size'),
      dataIndex: 'selectedSizeTitle',
      key: 'size',
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: CartItem) => (
        <InputNumber min={1} defaultValue={quantity} onChange={(value) => onChangeQuantity(value, record)} />
      ),
    },
    {
      title: t('total_price'),
      key: 'totalPrice',
      render: (_: any, record: CartItem) => {
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
      title: t('action'),
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
              <Link href={`/${locale}`}>{t('home')}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{t('your_cart')}</Breadcrumb.Item>
          </Breadcrumb>
      </div>
      {cartItems.length === 0 ? (
        <p>{t('cart_is_empty')}</p>
      ) : (
        <>
          <Table dataSource={cartItems} columns={columns} rowKey={(record) => `${record.id}-${record.selectedColor?.id}-${record.selectedSizeId}`} pagination={false} />
          <div className="mt-4 flex justify-end items-center">
            <span className="font-semibold text-lg mr-4">{t('overall_total')}: {formatVND(getTotalPrice())}</span>
            <Button type="primary" size="large" onClick={handleCheckoutClick}>
              {t('checkout')}
            </Button>
          </div>
        </>
      )}

      <Modal
        title={t('login_required_title')}
        visible={isLoginModalVisible}
        onOk={handleLoginModalOk}
        onCancel={handleLoginModalCancel}
        okText={t('login_now')}
        cancelText={t('cancel')}
      >
        <p>{t('login_required_message')}</p>
      </Modal>
    </div>
  );
};

export default ShoppingCart;