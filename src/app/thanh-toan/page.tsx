'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Breadcrumb, Button, message, Input } from 'antd';
import Link from 'next/link';
import useCart from '@/stores/cartStore';
import OrderSummary from '@/components/layout/checkout/OrderSummary';
import ShippingInformation from '@/components/layout/checkout/ShippingInformation';
import ShippingMethodSelection from '@/components/layout/checkout/ShippingMethodSelection';
import PaymentMethodSelection from '@/components/layout/checkout/PaymentMethodSelection';
import { useRouter } from 'next/navigation';
import { CreateOrderDto, OrderItemDto } from '@/types/order/order.type';
import { useCreateOrder } from '@/hooks/order/useCreateOrder';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const { items: cartItems, clearCart } = useCart();
  const router = useRouter();

  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<number | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
  const [manualShippingFee, setManualShippingFee] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [appliedCouponId, setAppliedCouponId] = useState<number | null>(null);
  const [orderNote, setOrderNote] = useState<string>('');
  const [orderCompleted, setOrderCompleted] = useState(false);

  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const handleAddressSelected = (addressId: number) => {
    setSelectedShippingAddressId(addressId);
  };

  const handleShippingMethodSelected = (methodId: number | null, fee: number | null) => {
    setSelectedShippingMethodId(methodId);
    setManualShippingFee(fee);
  };

  const handlePaymentMethodSelected = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOrderNote(e.target.value);
  };

  const handleCouponApplied = (couponId: number | null, discountAmount: number | null) => {
    setAppliedCouponId(couponId);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      message.error('Giỏ hàng của bạn đang trống.');
      return;
    }
    if (selectedShippingAddressId === null) {
      message.error('Vui lòng điền thông tin giao hàng.');
      return;
    }

    if (selectedShippingMethodId === null && (manualShippingFee === null || manualShippingFee === undefined)) {
      message.error('Vui lòng chọn phương thức giao hàng hoặc nhập phí vận chuyển.');
      return;
    }
    if (manualShippingFee !== null && manualShippingFee < 0) {
      message.error('Phí giao hàng không thể âm.');
      return;
    }

    if (selectedPaymentMethod === null) {
      message.error('Vui lòng chọn phương thức thanh toán.');
      return;
    }

    const orderItems: OrderItemDto[] = cartItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      sizeId: item.sizeId,
      colorId: item.colorId,
      quantity: item.quantity,
    }));

    const payload: CreateOrderDto = {
      shippingAddressId: selectedShippingAddressId,
      items: orderItems,
      paymentMethod: selectedPaymentMethod,
      note: orderNote || undefined,
      couponId: appliedCouponId || undefined,
    };

    if (manualShippingFee !== null && manualShippingFee !== undefined) {
      payload.shippingFee = manualShippingFee;
      payload.shippingId = undefined;
    } else if (selectedShippingMethodId !== null) {
      payload.shippingId = selectedShippingMethodId;
      payload.shippingFee = undefined;
    }

    console.log('Order Payload:', payload);

    createOrder(payload, {
      onSuccess: (data) => {
        message.success('Đơn hàng đã được đặt thành công!');
        clearCart();
        setOrderCompleted(true);
        router.push(`/xac-nhan-don-hang`);
      },
      onError: (error) => {
        console.error('Error placing order:', error);
        message.error('Đặt hàng thất bại.');
      },
    });
  };

  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className="container lg:p-12 mx-auto p-4 md:p-8">
        <Title level={2}>Thanh toán</Title>
        <Text>Giỏ hàng của bạn đang trống. <Link href={`/gio-hang`}>Đi đến giỏ hàng</Link></Text>
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="container lg:p-12 mx-auto p-4 md:p-8">
        <Title level={2}>Đơn hàng đã được đặt thành công!</Title>
        <Text>Cảm ơn bạn đã đặt hàng.</Text>
        <div className="mt-4">
            <Link href={`/don-hang-cua-toi`}>
                <Button type="primary">Xem đơn hàng của tôi</Button>
            </Link>
            <Link href={`/`}>
                <Button className="ml-4">Tiếp tục mua sắm</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/gio-hang">Giỏ hàng của bạn</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Thanh toán</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Title level={2} className="mb-4">Thanh toán</Title>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          <div className="mb-6 border-b pb-4">
            <ShippingInformation onAddressSelected={handleAddressSelected} />
          </div>
          <div className="mb-6 border-b pb-4">
            <ShippingMethodSelection onMethodSelected={handleShippingMethodSelected} />
          </div>
          <div className="mb-6 border-b pb-4">
            <PaymentMethodSelection onMethodSelected={handlePaymentMethodSelected} />
          </div>

          <div className="mb-6 border-b pb-4">
            <Title level={4}>Ghi chú đơn hàng</Title>
            <TextArea
              rows={4}
              placeholder="Lời nhắn tới người bán"
              value={orderNote}
              onChange={handleNoteChange}
            />
          </div>

          <div>
            <Button type="primary" size="large" onClick={handlePlaceOrder}>
              Đặt hàng
            </Button>
          </div>
        </div>
        <div className="md:col-span-4">
          <div className="p-4 border rounded-lg shadow-sm">
            <OrderSummary onCouponApplied={handleCouponApplied} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;