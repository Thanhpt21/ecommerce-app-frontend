// components/layout/checkout/ShippingMethodSelection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Spin, message } from 'antd';
import useShippingMethod from '@/stores/shippingMethodStore';
import Image from 'next/image';

import GHTKLogo from '@/assets/images/delivery/ghtk.png';

import { useCalculateGHTKFee } from '@/hooks/ghtk/useCalculateGHTKFee';
// ⭐ IMPORT CalculateFeeDto VÀ GHTKRawFeeResponse TỪ TYPES FILE ⭐
import { CalculateFeeDto, GHTKRawFeeResponse } from '@/types/ghtk.type';

// ⭐ LOẠI BỎ interface GHTKRawFeeResponseForFrontend NẾU BẠN ĐÃ CÓ NÓ TRONG types/ghtk.type.ts ⭐
// Nếu bạn chưa chuyển nó vào types/ghtk.type.ts, hãy chuyển và loại bỏ khỏi đây.

const { Title } = Typography;

interface ShippingMethodSelectionProps {
  onMethodSelected: (methodId: number | null, fee: number | null) => void;
  deliveryProvince: string;
  deliveryDistrict: string;
  deliveryWard?: string | null;
  deliveryAddress?: string | null;
  totalWeight: number;
  totalValue: number;
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string | null;
  pickAddress: string;
}

const ShippingMethodSelection: React.FC<ShippingMethodSelectionProps> = ({
  onMethodSelected,
  deliveryProvince,
  deliveryDistrict,
  deliveryWard,
  deliveryAddress,
  totalWeight,
  totalValue,
  pickProvince,
  pickDistrict,
  pickWard,
  pickAddress,
}) => {
  const {
    selectedShippingMethod,
    setSelectedShippingMethod,
    setShippingFee,
  } = useShippingMethod();

  const {
    mutate: calculateFee,
    isPending: isCalculatingFee,
    data: ghtkFeeResponse, // Kiểu dữ liệu sẽ là GHTKRawFeeResponse
    error: ghtkError,
  } = useCalculateGHTKFee(); // Hook này bây giờ phải trả về GHTKRawFeeResponse

  const STANDARD_DELIVERY_ID = 0;

  const [localSelectedMethod, setLocalSelectedMethod] = useState<string>('standard');
  const [actualCalculatedFee, setActualCalculatedFee] = useState<number | null>(null);


  const [lastCalculatedPayload, setLastCalculatedPayload] = useState<CalculateFeeDto | null>(null);

  useEffect(() => {
    if (selectedShippingMethod !== 'standard') {
      setSelectedShippingMethod('standard');
    }
    setLocalSelectedMethod('standard');
  }, [selectedShippingMethod, setSelectedShippingMethod]);


  useEffect(() => {
    const isValidForCalculation =
      deliveryProvince &&
      deliveryDistrict &&
      pickProvince &&
      pickDistrict &&
      totalWeight > 0;

    if (!isValidForCalculation) {
      if (actualCalculatedFee !== null) {
          setActualCalculatedFee(null);
          setShippingFee(null);
          onMethodSelected(null, null);
      }
      setLastCalculatedPayload(null);
      console.log('Skipping GHTK fee calculation: missing required info.');
      return;
    }

    const currentPayload: CalculateFeeDto = {
      pick_province: pickProvince,
      pick_district: pickDistrict,
      pick_ward: pickWard,
      pick_address: pickAddress,
      province: deliveryProvince,
      district: deliveryDistrict,
      ward: deliveryWard,
      address: deliveryAddress,
      weight: totalWeight,
      value: totalValue,
      deliver_option: 'none',
      transport: 'road',
    };

    if (JSON.stringify(currentPayload) === JSON.stringify(lastCalculatedPayload)) {
      console.log('Skipping GHTK fee calculation: payload has not changed.');
      return;
    }

    console.log('Initiating GHTK fee calculation with payload:', currentPayload);
    setLastCalculatedPayload(currentPayload);

    calculateFee(currentPayload, {
      // ⭐ THAY ĐỔI KIỂU DỮ LIỆU Ở ĐÂY SANG GHTKRawFeeResponse ⭐
      onSuccess: (response: GHTKRawFeeResponse) => {
        // ⭐ ĐIỀU KIỆN KIỂM TRA VÀ TRUY CẬP ĐÚNG PHÍ VỚI CẤU TRÚC LỒNG NHAU ⭐
        if (response.success && response.fee?.success && response.fee?.fee && typeof response.fee.fee.fee === 'number') {
          const feeValue = response.fee.fee.fee; // ⭐ TRUY CẬP ĐÚNG ĐƯỜNG DẪN PHÍ ⭐
          if (actualCalculatedFee !== feeValue) {
            setActualCalculatedFee(feeValue);
            setShippingFee(feeValue);
            onMethodSelected(STANDARD_DELIVERY_ID, feeValue);
          }
        } else {
          if (actualCalculatedFee !== null) {
            setActualCalculatedFee(null);
            setShippingFee(null);
            onMethodSelected(null, null);
          }
          // Sử dụng message từ GHTK hoặc fallback
          message.error(response.fee?.message || response.message || 'Không thể tính phí vận chuyển GHTK do lỗi dữ liệu trả về hoặc phí không phải là số.');
          console.error("GHTK API returned an invalid fee format or missing fee.fee.fee:", response);
        }
      },
      onError: (err: any) => {
        if (actualCalculatedFee !== null) {
            setActualCalculatedFee(null);
            setShippingFee(null);
            onMethodSelected(null, null);
        }
        const errorMessage = err.response?.data?.message || 'Lỗi kết nối khi tính phí vận chuyển.';
        message.error(errorMessage);
        console.error('Error calculating GHTK fee:', err);
      },
    });

  }, [
    deliveryProvince,
    deliveryDistrict,
    deliveryWard,
    deliveryAddress,
    totalWeight,
    totalValue,
    pickProvince,
    pickDistrict,
    pickWard,
    pickAddress,
    calculateFee,
    setShippingFee,
    onMethodSelected,
    actualCalculatedFee,
    lastCalculatedPayload,
  ]);


  const handleSelectMethod = (method: string) => {
    setSelectedShippingMethod(method);
    setLocalSelectedMethod(method);

    if (method === 'standard') {
      if (actualCalculatedFee !== null) {
        onMethodSelected(STANDARD_DELIVERY_ID, actualCalculatedFee);
        setShippingFee(actualCalculatedFee);
      }
    }
    console.log('Selected shipping method:', method);
  };

  return (
    <div>
      <Typography.Title level={4}>Phương thức giao hàng</Typography.Title>
      <div className="mb-4">
        <Button
          type={localSelectedMethod === 'standard' ? 'primary' : 'default'}
          onClick={() => handleSelectMethod('standard')}
          disabled={isCalculatingFee || !deliveryProvince || !deliveryDistrict || !pickProvince || !pickDistrict || totalWeight <= 0}
        >
          Giao hàng tiết kiệm
          {isCalculatingFee && <Spin size="small" className="ml-2" />}
        </Button>
      </div>

      {localSelectedMethod === 'standard' && (
        <div className="mb-4">
          <Typography.Text strong>Phí giao hàng tiết kiệm:</Typography.Text>
          {isCalculatingFee ? (
              <Typography.Text type="warning"> Đang tính phí...</Typography.Text>
          ) : actualCalculatedFee !== null ? (
            <Typography.Text> {actualCalculatedFee.toLocaleString('vi-VN')} VNĐ</Typography.Text>
          ) : (
            <Typography.Text type="danger"> Không thể tính phí (kiểm tra địa chỉ, trọng lượng)</Typography.Text>
          )}

          <br />
          <Typography.Text type="secondary" className="text-sm">
            Thời gian giao hàng dự kiến từ 3-7 ngày làm việc.
          </Typography.Text>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <Typography.Text strong>Được hỗ trợ bởi:</Typography.Text>
            <Image src={GHTKLogo} alt="Giao Hàng Tiết Kiệm" width={60} height={20} className="object-contain" />
          </div>
        </div>
      )}
      {ghtkError && (
        <Typography.Text type="danger" className="text-sm">
          Lỗi: {ghtkError.message || 'Không thể tính phí vận chuyển.'}
        </Typography.Text>
      )}
    </div>
  );
};

export default ShippingMethodSelection;