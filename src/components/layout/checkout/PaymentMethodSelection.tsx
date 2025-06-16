// components/layout/checkout/PaymentMethodSelection.tsx
import React, { useState, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { PaymentMethod } from '@/enums/order.enums';
import MomoQr from '@/assets/images/momo-qr.jpg';
import Image from 'next/image';

const { Title, Paragraph } = Typography;

interface PaymentMethodSelectionProps {
  onMethodSelected: (method: PaymentMethod) => void;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({ onMethodSelected }) => {
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod>(PaymentMethod.COD);

  useEffect(() => {
    onMethodSelected(PaymentMethod.COD);
  }, [onMethodSelected]);

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setLocalSelectedMethod(method);
    console.log('Selected payment method:', method);
    onMethodSelected(method);
  };

  const renderPaymentMethodContent = () => {
    switch (localSelectedMethod) {
      case PaymentMethod.COD:
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5} className="mb-2">Thanh toán khi nhận hàng (COD)</Title>
            <Paragraph className="text-gray-700">
              Bạn có thể thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản cho nhân viên giao hàng khi nhận được sản phẩm.
            </Paragraph>
            <Paragraph className="text-gray-700">
              Vui lòng chuẩn bị sẵn số tiền thanh toán để quá trình nhận hàng diễn ra nhanh chóng.
            </Paragraph>
          </div>
        );
      case PaymentMethod.Bank:
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5} className="mb-2">Chuyển khoản ngân hàng</Title>
            <Paragraph className="text-gray-700">
              Vui lòng chuyển khoản vào tài khoản ngân hàng dưới đây. Đơn hàng của bạn sẽ được xử lý sau khi thanh toán được xác nhận.
            </Paragraph>
            <div className="bg-white p-3 rounded-md border border-dashed border-gray-300 text-sm">
              <p><strong>Tên ngân hàng:</strong> Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)</p>
              <p><strong>Số tài khoản:</strong> 0011002345678</p>
              <p><strong>Chủ tài khoản:</strong> CÔNG TY TNHH ABC</p>
              <p><strong>Nội dung chuyển khoản:</strong> [Mã đơn hàng] - [Số điện thoại của bạn]</p>
            </div>
            <Paragraph className="text-gray-700 mt-2">
              Vui lòng ghi rõ mã đơn hàng và số điện thoại của bạn trong nội dung chuyển khoản.
            </Paragraph>
          </div>
        );
      case PaymentMethod.Momo:
        return (
          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
            <Title level={5} className="mb-2">Thanh toán qua Momo</Title>
            <Paragraph className="text-gray-700">
              Quét mã QR dưới đây để thanh toán qua ứng dụng Momo. Đơn hàng sẽ được xử lý ngay sau khi bạn hoàn tất giao dịch.
            </Paragraph>
            <div className="bg-white p-3 rounded-md border border-dashed border-gray-300 text-sm text-center">
              <Image src={MomoQr} alt="Momo QR Code" width={150} height={150} className="mx-auto mb-2" />
              <p><strong>Số điện thoại Momo:</strong> 09xxxxxxxx</p>
              <p><strong>Tên tài khoản:</strong> CÔNG TY TNHH ABC</p>
              <p><strong>Nội dung chuyển khoản:</strong> [Mã đơn hàng] - [Số điện thoại của bạn]</p>
            </div>
            <Paragraph className="text-gray-700 mt-2">
              Vui lòng kiểm tra kỹ thông tin và nhập đúng nội dung chuyển khoản để đơn hàng được xác nhận nhanh nhất.
            </Paragraph>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Typography.Title level={4}>Phương thức thanh toán</Typography.Title>
      <div className="mb-4">
        <Button
          type={localSelectedMethod === PaymentMethod.COD ? 'primary' : 'default'}
          onClick={() => handleSelectPaymentMethod(PaymentMethod.COD)}
          className="mr-2"
        >
          Thanh toán khi nhận hàng
        </Button>
        <Button
          type={localSelectedMethod === PaymentMethod.Bank ? 'primary' : 'default'}
          onClick={() => handleSelectPaymentMethod(PaymentMethod.Bank)}
          className="mr-2"
        >
          Chuyển khoản ngân hàng
        </Button>
        <Button
          type={localSelectedMethod === PaymentMethod.Momo ? 'primary' : 'default'}
          onClick={() => handleSelectPaymentMethod(PaymentMethod.Momo)}
        >
          Momo
        </Button>
      </div>

      {renderPaymentMethodContent()}
    </div>
  );
};

export default PaymentMethodSelection;