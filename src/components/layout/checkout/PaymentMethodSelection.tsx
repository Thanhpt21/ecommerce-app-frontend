// components/layout/checkout/PaymentMethodSelection.tsx
import React, { useState, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from '@/enums/order.enums';
import MomoQr from '@/assets/images/momo-qr.jpg'
import Image from 'next/image';



const { Title, Paragraph } = Typography; // Thêm Paragraph

interface PaymentMethodSelectionProps {
  onMethodSelected: (method: PaymentMethod) => void;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({ onMethodSelected }) => {
  const { t } = useTranslation('checkout');

  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod>(PaymentMethod.COD);

  useEffect(() => {
    onMethodSelected(PaymentMethod.COD); // Báo cho component cha về lựa chọn mặc định
  }, [onMethodSelected]);

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setLocalSelectedMethod(method);
    console.log('Selected payment method:', method);
    onMethodSelected(method);
  };

  // --- Nội dung ảo cho từng phương thức thanh toán ---
  const renderPaymentMethodContent = () => {
    switch (localSelectedMethod) {
      case PaymentMethod.COD:
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5} className="mb-2">{t('cod_title')}</Title>
            <Paragraph className="text-gray-700">
              {t('cod_description_1')}
            </Paragraph>
            <Paragraph className="text-gray-700">
              {t('cod_description_2')}
            </Paragraph>
          </div>
        );
      case PaymentMethod.Bank:
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5} className="mb-2">{t('bank_transfer_title')}</Title>
            <Paragraph className="text-gray-700">
              {t('bank_transfer_description_1')}
            </Paragraph>
            <div className="bg-white p-3 rounded-md border border-dashed border-gray-300 text-sm">
                <p><strong>{t('bank_name')}:</strong> {t('bank_name_value')}</p>
                <p><strong>{t('account_number')}:</strong> {t('account_number_value')}</p>
                <p><strong>{t('account_holder')}:</strong> {t('account_holder_value')}</p>
                <p><strong>{t('transfer_content')}:</strong> {t('transfer_content_value')}</p>
            </div>
            <Paragraph className="text-gray-700 mt-2">
              {t('bank_transfer_description_2')}
            </Paragraph>
          </div>
        );
      case PaymentMethod.Momo:
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5} className="mb-2">{t('momo_title')}</Title>
            <Paragraph className="text-gray-700">
              {t('momo_description_1')}
            </Paragraph>
            <div className="bg-white p-3 rounded-md border border-dashed border-gray-300 text-sm text-center">
                <Image src={MomoQr} alt="Momo QR Code" width={150} height={150} className="mx-auto mb-2" />
                <p><strong>{t('momo_phone_number')}:</strong> {t('momo_phone_number_value')}</p>
                <p><strong>{t('momo_account_name')}:</strong> {t('momo_account_name_value')}</p>
                <p><strong>{t('transfer_content')}:</strong> {t('transfer_content_value')}</p>
            </div>
            <Paragraph className="text-gray-700 mt-2">
              {t('momo_description_2')}
            </Paragraph>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Typography.Title level={4}>{t('payment_method')}</Typography.Title>
      <div className="mb-4">
        <Button
          type={localSelectedMethod === PaymentMethod.COD ? 'primary' : 'default'}
          onClick={() => handleSelectPaymentMethod(PaymentMethod.COD)}
          className="mr-2"
        >
          {t('cash_on_delivery')}
        </Button>
        <Button
          type={localSelectedMethod === PaymentMethod.Bank ? 'primary' : 'default'}
          onClick={() => handleSelectPaymentMethod(PaymentMethod.Bank)}
          className="mr-2"
        >
          {t('bank_transfer')}
        </Button>
        <Button
          type={localSelectedMethod === PaymentMethod.Momo ? 'primary' : 'default'}
          onClick={() => handleSelectPaymentMethod(PaymentMethod.Momo)}
        >
          {t('momo')}
        </Button>
      </div>

      {/* HIỂN THỊ NỘI DUNG TƯƠNG ỨNG */}
      {renderPaymentMethodContent()}
    </div>
  );
};

export default PaymentMethodSelection;