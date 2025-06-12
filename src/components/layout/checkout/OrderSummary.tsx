// components/checkout/OrderSummary.tsx
import Image from 'next/image';
import { Typography, Input, Button, message } from 'antd';
import { formatVND } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';
import useCart from '@/stores/cartStore';
import useShippingMethod from '@/stores/shippingMethodStore';
import { useState } from 'react';
import { useUseCoupon } from '@/hooks/coupon/useUseCoupon';

const { Title, Text } = Typography;

// Định nghĩa props mới cho OrderSummary
interface OrderSummaryProps {
  // Callback để truyền couponId và discountAmount lên component cha
  onCouponApplied: (couponId: number | null, discountAmount: number | null) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onCouponApplied }) => {
  const { items: cartItems, getTotalPrice } = useCart();
  const { t } = useTranslation('checkout');
  const totalPrice = getTotalPrice();

  const { shippingFee } = useShippingMethod();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);

  const { mutate: applyCoupon } = useUseCoupon();

  const temporaryTotal = totalPrice;
  const currentShippingFee = shippingFee || 0;
  const finalTotal = temporaryTotal + currentShippingFee - (discountAmount || 0);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) { // Sử dụng .trim() để loại bỏ khoảng trắng
      message.warning(t('please_enter_coupon_code'));
      return;
    }

    applyCoupon(
      { code: couponCode.trim(), orderValue: temporaryTotal }, // Truyền mã coupon đã trim
      {
        onSuccess: (response) => {
          if (response.success) {
            setDiscountAmount(response.discountAmount || null);
            // --- GỌI CALLBACK ĐỂ TRUYỀN DỮ LIỆU LÊN COMPONENT CHA ---
            onCouponApplied(response.couponId || null, response.discountAmount || null); // Giả sử response có couponId
            message.success(t('coupon_applied_success', { discount: formatVND(response.discountAmount || 0) }));
          } else {
            setDiscountAmount(null);
            onCouponApplied(null, null); // Reset coupon ở cha nếu không thành công
            message.error(response.message || t('invalid_coupon'));
          }
        },
        onError: (error) => {
          setDiscountAmount(null);
          onCouponApplied(null, null); // Reset coupon ở cha nếu lỗi
          const errorMessage = (error as any)?.response?.data?.message || error.message || t('failed_to_apply_coupon');
          message.error(errorMessage);
        },
      }
    );
  };

  return (
    <div>
      {/* ... (Phần hiển thị sản phẩm trong giỏ hàng) ... */}
      {cartItems.map((item) => (
        <div key={item.id} className="flex items-center py-2 border-b"> {/* Sử dụng item.id mới */}
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
          placeholder={t('enter_coupon_code')}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="mr-2"
        />
        <Button onClick={handleApplyCoupon}>
          {t('apply')}
        </Button>
      </div>

      <div className="py-4">
        <div className="flex justify-between py-1">
          <Text strong>{t('subtotal')}:</Text>
          <Text>{formatVND(temporaryTotal)}</Text>
        </div>
        <div className="flex justify-between py-1">
          <Text strong>{t('shipping_fee')}:</Text>
          <Text>{formatVND(currentShippingFee)}</Text>
        </div>
        {discountAmount !== null && (
          <div className="flex justify-between py-1 text-green-500">
            <Text strong>{t('discount')}:</Text>
            <Text>- {formatVND(discountAmount)}</Text>
          </div>
        )}
        <div className="py-2 border-t">
          <Title level={4} className="text-right">
            {t('total')}: {formatVND(finalTotal)}
          </Title>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;