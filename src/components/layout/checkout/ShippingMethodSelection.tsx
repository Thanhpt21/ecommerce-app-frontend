// components/layout/checkout/ShippingMethodSelection.tsx
import React, { useState, useEffect } from 'react';
import { Button, Typography, Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import useShippingMethod from '@/stores/shippingMethodStore';
import { useAllShippings } from '@/hooks/shipping/useAllShippings';
import { Shipping } from '@/types/shipping.type';
import Image from 'next/image';

// Import các hình ảnh logo (điều chỉnh đường dẫn cho đúng với dự án của bạn)
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
  const { t } = useTranslation('checkout');
  const {
    selectedShippingMethod,
    setSelectedShippingMethod,
    setShippingFee,
  } = useShippingMethod();

  const { data: allShippingsData, isLoading, isError, error } = useAllShippings();

  // Khởi tạo localSelectedMethod là 'standard' nếu chưa có giá trị trong store
  const [localSelectedMethod, setLocalSelectedMethod] = useState<string | null>(
    selectedShippingMethod || 'standard' // ĐẶT MẶC ĐỊNH LÀ 'standard' TẠI ĐÂY
  );
  const standardDeliveryFee = 30000;
  const STANDARD_DELIVERY_ID = 0; // Hoặc một ID khác bạn gán cho Giao hàng tiêu chuẩn

  // Effect để xử lý trạng thái khi component mount hoặc selectedShippingMethod thay đổi
  useEffect(() => {
    // Nếu chưa có phương thức nào được chọn trong store, mặc định chọn 'standard'
    if (!selectedShippingMethod) {
      setSelectedShippingMethod('standard');
      setLocalSelectedMethod('standard');
      setShippingFee(standardDeliveryFee);
      onMethodSelected(STANDARD_DELIVERY_ID, standardDeliveryFee);
    } else {
      // Nếu đã có từ store, cập nhật local state
      setLocalSelectedMethod(selectedShippingMethod);

      // Đảm bảo onMethodSelected được gọi lại với thông tin phí và ID chính xác
      let idToReport: number | null = null;
      let feeToReport: number | null = null;

      if (selectedShippingMethod === 'standard') {
        idToReport = STANDARD_DELIVERY_ID;
        feeToReport = standardDeliveryFee;
      } else if (selectedShippingMethod !== 'express' && allShippingsData?.data) {
        // Đây là trường hợp đã chọn một tỉnh cụ thể cho Giao hàng nhanh
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
    return <Spin>{t('loading_shipping_methods')}...</Spin>;
  }

  if (isError) {
    console.error('Error fetching shipping methods:', error);
    return <Typography.Text type="danger">{t('error_loading_shipping_methods')}</Typography.Text>;
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
      <Typography.Title level={4}>{t('delivery_method')}</Typography.Title>
      <div className="mb-4">
        <Button
          type={localSelectedMethod === 'standard' ? 'primary' : 'default'}
          onClick={() => handleSelectMethod('standard')}
          className="mr-2"
        >
          {t('standard_delivery')}
        </Button>
        <Button
          type={isExpressSelected ? 'primary' : 'default'}
          onClick={() => handleSelectMethod('express')}
        >
          {t('express_delivery')}
        </Button>
      </div>

      {localSelectedMethod === 'standard' && (
        <div className="mb-4">
          <Typography.Text strong>{t('standard_delivery_fee')}:</Typography.Text>
          <Typography.Text> {standardDeliveryFee.toLocaleString('vi-VN')} VNĐ</Typography.Text>
          <br />
          <Typography.Text type="secondary" className="text-sm">
            {t('standard_delivery_desc')}
          </Typography.Text>
          {/* THÊM CÁC LOGO ĐƠN VỊ VẬN CHUYỂN */}
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <Typography.Text strong>{t('supported_by')}:</Typography.Text>
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
          <Typography.Text strong>{t('select_province_for_express_prompt')}:</Typography.Text>
          <Select
            placeholder={t('select_a_province')}
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
                {t('express_delivery_fee_for')} {localSelectedMethod}:
              </Typography.Text>
              <Typography.Text> {feeToDisplay.toLocaleString('vi-VN')} VNĐ</Typography.Text>
              <br />
              <Typography.Text type="secondary" className="text-sm">
                {t('express_delivery_desc')}
              </Typography.Text>
            </div>
          )}
          {localSelectedMethod === 'express' && feeToDisplay === null && (
            <div className="mt-2">
              <Typography.Text type="secondary">{t('please_select_a_province_to_see_fee')}</Typography.Text>
            </div>
          )}
           {/* THÊM CÁC LOGO ĐƠN VỊ VẬN CHUYỂN NHANH NẾU CÓ */}
           {isExpressSelected && feeToDisplay !== null && (
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <Typography.Text strong>{t('express_supported_by')}:</Typography.Text>
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