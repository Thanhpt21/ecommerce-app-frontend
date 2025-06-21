// components/checkout/OrderSummary.tsx
import Image from 'next/image';
import { Typography, Input, Button, message } from 'antd';
import { formatVND } from '@/utils/helpers';
import useCart from '@/stores/cartStore';
import useShippingMethod from '@/stores/shippingMethodStore';
import { useState } from 'react';
import { useUseCoupon } from '@/hooks/coupon/useUseCoupon';

const { Title, Text } = Typography;

interface OrderSummaryProps {
  onCouponApplied: (couponId: number | null, discountAmount: number | null) => void;
  shippingFee: number | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onCouponApplied, shippingFee }) => {
  const { items: cartItems, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();


  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);

  const { mutate: applyCoupon } = useUseCoupon();

  const temporaryTotal = totalPrice;
  const currentShippingFee = shippingFee || 0;
  const finalTotal = temporaryTotal + currentShippingFee - (discountAmount || 0);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      message.warning('Vui lòng nhập mã giảm giá.');
      return;
    }

    applyCoupon(
      { code: couponCode.trim(), orderValue: temporaryTotal },
      {
        onSuccess: (response) => {
          if (response.success) {
            setDiscountAmount(response.discountAmount || null);
            onCouponApplied(response.couponId || null, response.discountAmount || null);
            message.success(`Mã giảm giá đã được áp dụng. Giảm: ${formatVND(response.discountAmount || 0)}`);
          } else {
            setDiscountAmount(null);
            onCouponApplied(null, null);
            message.error(response.message || 'Mã giảm giá không hợp lệ.');
          }
        },
        onError: (error) => {
          setDiscountAmount(null);
          onCouponApplied(null, null);
          const errorMessage = (error as any)?.response?.data?.message || error.message || 'Áp dụng mã giảm giá thất bại.';
          message.error(errorMessage);
        },
      }
    );
  };

  return (
    <div>
      {cartItems.map((item) => (
        <div key={item.id} className="flex items-center py-2 border-b">
          <div className="relative w-16 h-16 mr-4">
            <Image src={item.thumb} alt={item.title} fill style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <Text strong>{item.title}</Text>
            {item.selectedColor && <Text className="ml-1">({item.selectedColor.title})</Text>}
            {item.selectedSizeTitle && <Text className="ml-1"> - {item.selectedSizeTitle}</Text>}
            <div className="flex items-center">
              <Text>{formatVND(item.discountedPrice !== undefined ? item.discountedPrice : item.price)}</Text>
              {item.discountedPrice !== undefined && (
                <Text delete className="ml-1 text-gray-500">{formatVND(item.price)}</Text>
              )}
              <Text className="ml-2">x {item.quantity}</Text>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 flex items-center">
        <Input
          placeholder="Nhập mã giảm giá"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="mr-2"
        />
        <Button onClick={handleApplyCoupon}>
          Áp dụng
        </Button>
      </div>

      <div className="py-4">
        <div className="flex justify-between py-1">
          <Text strong>Tổng phụ:</Text>
          <Text>{formatVND(temporaryTotal)}</Text>
        </div>
        <div className="flex justify-between py-1">
          <Text strong>Phí vận chuyển:</Text>
          <Text>{formatVND(currentShippingFee)}</Text>
        </div>
        {discountAmount !== null && (
          <div className="flex justify-between py-1 text-green-500">
            <Text strong>Giảm giá:</Text>
            <Text>- {formatVND(discountAmount)}</Text>
          </div>
        )}
        <div className="py-2 border-t">
          <Title level={4} className="text-right">
            Tổng cộng: {formatVND(finalTotal)}
          </Title>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;