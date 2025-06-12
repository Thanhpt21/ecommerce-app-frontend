'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Breadcrumb, Button, message, Input } from 'antd'; // Import Input
import Link from 'next/link';
import { useLocaleContext } from '@/context/LocaleContext';
import useCart from '@/stores/cartStore';
import OrderSummary from '@/components/layout/checkout/OrderSummary';
import ShippingInformation from '@/components/layout/checkout/ShippingInformation';
import ShippingMethodSelection from '@/components/layout/checkout/ShippingMethodSelection';
import PaymentMethodSelection from '@/components/layout/checkout/PaymentMethodSelection';
import { useRouter } from 'next/navigation';
import { CreateOrderDto, OrderItemDto } from '@/types/order/order.type';
import { useCreateOrder } from '@/hooks/order/useCreateOrder';

const { Title, Text } = Typography;
const { TextArea } = Input; // Destructure TextArea from Input

const CheckoutPage = () => {
  const { t } = useTranslation('checkout');
  const { items: cartItems, clearCart } = useCart();
  const { locale } = useLocaleContext();
  const router = useRouter();

  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<number | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
  const [manualShippingFee, setManualShippingFee] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [appliedCouponId, setAppliedCouponId] = useState<number | null>(null);
  const [orderNote, setOrderNote] = useState<string>(''); // State cho ghi chú
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

  // Hàm xử lý khi người dùng nhập ghi chú
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOrderNote(e.target.value);
  };

  const handleCouponApplied = (couponId: number | null, discountAmount: number | null) => {
    setAppliedCouponId(couponId);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      message.error(t('your_cart_is_empty'));
      return;
    }
    if (selectedShippingAddressId === null) {
      message.error(t('please_fill_shipping_info'));
      return;
    }

    if (selectedShippingMethodId === null && (manualShippingFee === null || manualShippingFee === undefined)) {
      message.error(t('please_select_delivery_method_or_enter_shipping_fee'));
      return;
    }
    if (manualShippingFee !== null && manualShippingFee < 0) {
      message.error(t('shipping_fee_cannot_be_negative', 'Phí giao hàng không thể âm'));
      return;
    }

    if (selectedPaymentMethod === null) {
      message.error(t('please_select_payment_method'));
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
      note: orderNote || undefined, // Nếu orderNote rỗng thì gửi undefined
      couponId: appliedCouponId || undefined,
    };

     if (manualShippingFee !== null && manualShippingFee !== undefined) {
      // Nếu có phí được xác định (từ standard hoặc express), gửi phí đó.
      // Và KHÔNG gửi shippingId, để backend chỉ dựa vào shippingFee.
      payload.shippingFee = manualShippingFee;
      payload.shippingId = undefined; // Đảm bảo shippingId là undefined
    } else if (selectedShippingMethodId !== null) {
      // Nếu không có phí (tức là manualShippingFee là null/undefined)
      // nhưng có một shippingId được chọn, gửi shippingId đó.
      payload.shippingId = selectedShippingMethodId;
      payload.shippingFee = undefined; // Đảm bảo shippingFee là undefined
    }

    console.log('Order Payload:', payload);

    createOrder(payload, {
      onSuccess: (data) => {
        message.success(t('order_placed_successfully'));
        clearCart();
        setOrderCompleted(true);
        // Chuyển hướng người dùng đến trang xác nhận đơn hàng hoặc chi tiết đơn hàng
        // Bạn có thể thêm order ID vào URL nếu muốn hiển thị chi tiết đơn hàng cụ thể
       router.push(`/${locale}/xac-nhan-don-hang`);
      },
      onError: (error) => {
        console.error('Error placing order:', error);
        // Hiển thị thông báo lỗi chi tiết hơn nếu có thể
        message.error(t('failed_to_place_order'));
      },
    });

  };

  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className="container lg:p-12 mx-auto p-4 md:p-8">
        <Title level={2}>{t('checkout')}</Title>
        <Text>{t('your_cart_is_empty')}. <Link href={`/${locale}/gio-hang`}>{t('go_to_cart')}</Link></Text>
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Title level={2}>{t('order_placed_successfully')}</Title>
        <Text>{t('thank_you_for_your_order')}.</Text>
        <div className="mt-4">
            <Link href={`/${locale}/don-hang-cua-toi`}>
                <Button type="primary">{t('view_my_orders')}</Button>
            </Link>
            <Link href={`/${locale}`}>
                <Button className="ml-4">{t('continue_shopping')}</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href={`/${locale}`}>{t('home')}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/${locale}/gio-hang`}>{t('your_cart')}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{t('checkout')}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Title level={2} className="mb-4">{t('checkout')}</Title>

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

          {/* Dòng code mới cho TextArea ghi chú */}
          <div className="mb-6 border-b pb-4">
            <Title level={4}>{t('order_note_title', 'Ghi chú đơn hàng')}</Title> {/* Thêm title cho ghi chú */}
            <TextArea
              rows={4}
              placeholder={t('order_note_placeholder', 'Lời nhắn tới người bán')} // Sử dụng t() cho placeholder
              value={orderNote}
              onChange={handleNoteChange}
            />
          </div>
          {/* Kết thúc dòng code mới */}

          <div>
            <Button type="primary" size="large" onClick={handlePlaceOrder}>
              {t('place_order')}
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