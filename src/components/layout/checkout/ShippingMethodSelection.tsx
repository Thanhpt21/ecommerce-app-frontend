// components/layout/checkout/ShippingMethodSelection.tsx
import React, { useState, useEffect } from 'react';
import { Button, Typography, Select, Spin } from 'antd';
import useShippingMethod from '@/stores/shippingMethodStore';
import { useAllShippings } from '@/hooks/shipping/useAllShippings';
import { Shipping } from '@/types/shipping.type';
import Image from 'next/image';

import VietnamPostLogo from '@/assets/images/delivery/vietnam-post.png';
import GHTKLogo from '@/assets/images/delivery/ghtk.png';
import GHNLogo from '@/assets/images/delivery/ghn.png';
import JnTExpressLogo from '@/assets/images/delivery/jnt-express.png';
import ViettelPostLogo from '@/assets/images/delivery/viettel-post.png';

const { Title } = Typography;

interface ShippingMethodSelectionProps {
  onMethodSelected: (methodId: number | null, fee: number | null) => void;
}

const ShippingMethodSelection: React.FC<ShippingMethodSelectionProps> = ({ onMethodSelected }) => {
  const {
    selectedShippingMethod,
    setSelectedShippingMethod,
    setShippingFee,
  } = useShippingMethod();

  const { data: allShippingsData, isLoading, isError, error } = useAllShippings();

  const standardDeliveryFee = 30000;
  const STANDARD_DELIVERY_ID = 0;

  const [localSelectedMethod, setLocalSelectedMethod] = useState<string | null>(
    selectedShippingMethod || 'standard'
  );

  useEffect(() => {
    if (!selectedShippingMethod) {
      setSelectedShippingMethod('standard');
      setLocalSelectedMethod('standard');
      setShippingFee(standardDeliveryFee);
      onMethodSelected(STANDARD_DELIVERY_ID, standardDeliveryFee);
    } else {
      setLocalSelectedMethod(selectedShippingMethod);

      let idToReport: number | null = null;
      let feeToReport: number | null = null;

      if (selectedShippingMethod === 'standard') {
        idToReport = STANDARD_DELIVERY_ID;
        feeToReport = standardDeliveryFee;
      } else if (selectedShippingMethod !== 'express' && allShippingsData?.data) {
        const foundProvince = allShippingsData.data.find(
          (ship) => ship.provinceName === selectedShippingMethod
        );
        if (foundProvince) {
          idToReport = foundProvince.id;
          feeToReport = foundProvince.fee;
        }
      }

      setShippingFee(feeToReport);
      onMethodSelected(idToReport, feeToReport);
    }
  }, [selectedShippingMethod, allShippingsData, standardDeliveryFee, setSelectedShippingMethod, setShippingFee, onMethodSelected]);


  const handleSelectMethod = (method: string) => {
    setSelectedShippingMethod(method);
    setLocalSelectedMethod(method);

    if (method === 'standard') {
      onMethodSelected(STANDARD_DELIVERY_ID, standardDeliveryFee);
      setShippingFee(standardDeliveryFee);
    } else {
      onMethodSelected(null, null);
      setShippingFee(null);
    }
    console.log('Selected shipping method:', method);
  };

  const handleSelectProvince = (provinceName: string) => {
    setSelectedShippingMethod(provinceName);
    setLocalSelectedMethod(provinceName);

    const selectedShipping = allShippingsData?.data.find(
      (ship) => ship.provinceName === provinceName
    );
    const fee = selectedShipping?.fee || null;
    const id = selectedShipping?.id || null;

    setShippingFee(fee);
    onMethodSelected(id, fee);
    console.log('Selected province:', provinceName, 'Fee:', fee);
  };

  if (isLoading) {
    return <Spin>Đang tải phương thức giao hàng...</Spin>;
  }

  if (isError) {
    console.error('Error fetching shipping methods:', error);
    return <Typography.Text type="danger">Lỗi khi tải phương thức giao hàng</Typography.Text>;
  }

  const shippingProvinces = allShippingsData?.data || [];

  const isExpressSelected =
    localSelectedMethod === 'express' ||
    (localSelectedMethod !== 'standard' && localSelectedMethod !== null);

  const feeToDisplay =
    selectedShippingMethod === 'standard'
      ? standardDeliveryFee
      : allShippingsData?.data.find(ship => ship.provinceName === selectedShippingMethod)?.fee;

  return (
    <div>
      <Typography.Title level={4}>Phương thức giao hàng</Typography.Title>
      <div className="mb-4">
        <Button
          type={localSelectedMethod === 'standard' ? 'primary' : 'default'}
          onClick={() => handleSelectMethod('standard')}
          className="mr-2"
        >
          Giao hàng tiêu chuẩn
        </Button>
        <Button
          type={isExpressSelected ? 'primary' : 'default'}
          onClick={() => handleSelectMethod('express')}
        >
          Giao hàng nhanh
        </Button>
      </div>

      {localSelectedMethod === 'standard' && (
        <div className="mb-4">
          <Typography.Text strong>Phí giao hàng tiêu chuẩn:</Typography.Text>
          <Typography.Text> {standardDeliveryFee.toLocaleString('vi-VN')} VNĐ</Typography.Text>
          <br />
          <Typography.Text type="secondary" className="text-sm">
            Thời gian giao hàng dự kiến từ 3-7 ngày làm việc.
          </Typography.Text>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <Typography.Text strong>Được hỗ trợ bởi:</Typography.Text>
            <Image src={VietnamPostLogo} alt="Vietnam Post" width={60} height={20} className="object-contain" />
            <Image src={GHTKLogo} alt="Giao Hàng Tiết Kiệm" width={60} height={20} className="object-contain" />
            <Image src={GHNLogo} alt="Giao Hàng Nhanh" width={60} height={20} className="object-contain" />
            <Image src={JnTExpressLogo} alt="J&T Express" width={60} height={20} className="object-contain" />
            <Image src={ViettelPostLogo} alt="Viettel Post" width={60} height={20} className="object-contain" />
          </div>
        </div>
      )}

      {(localSelectedMethod === 'express' || (localSelectedMethod !== 'standard' && localSelectedMethod !== null)) && (
        <div className="mb-4">
          <Typography.Text strong>Vui lòng chọn tỉnh/thành phố để xem phí giao hàng nhanh:</Typography.Text>
          <Select
            placeholder="Chọn tỉnh/thành phố"
            style={{ width: '100%' }}
            onChange={handleSelectProvince}
            value={localSelectedMethod === 'express' ? undefined : localSelectedMethod}
          >
            {shippingProvinces.map((shipping) => (
              <Select.Option key={shipping.id} value={shipping.provinceName}>
                {shipping.provinceName}
              </Select.Option>
            ))}
          </Select>
          {feeToDisplay !== null && feeToDisplay !== undefined && localSelectedMethod !== 'express' && (
            <div className="mt-2">
              <Typography.Text strong>
                Phí giao hàng nhanh cho {localSelectedMethod}:
              </Typography.Text>
              <Typography.Text> {feeToDisplay.toLocaleString('vi-VN')} VNĐ</Typography.Text>
              <br />
              <Typography.Text type="secondary" className="text-sm">
                Thời gian giao hàng dự kiến từ 1-3 ngày làm việc.
              </Typography.Text>
            </div>
          )}
          {localSelectedMethod === 'express' && feeToDisplay === null && (
            <div className="mt-2">
              <Typography.Text type="secondary">Vui lòng chọn một tỉnh/thành phố để xem phí.</Typography.Text>
            </div>
          )}
          {isExpressSelected && feeToDisplay !== null && (
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <Typography.Text strong>Được hỗ trợ bởi:</Typography.Text>
              <Image src={GHNLogo} alt="Giao Hàng Nhanh Express" width={60} height={20} className="object-contain" />
              <Image src={JnTExpressLogo} alt="J&T Express" width={60} height={20} className="object-contain" />
              <Image src={ViettelPostLogo} alt="Viettel Post Express" width={60} height={20} className="object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingMethodSelection;