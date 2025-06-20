// src/components/layout/checkout/ShippingInformation.tsx

'use client';

import { Input, Button, Typography, Row, Col, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import useCart from '@/stores/cartStore';
import { ShippingAddress } from '@/types/shipping-address.type';
import { useShippingAddresses } from '@/hooks/shipping-address/useShippingAddresses';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import useShippingInfo from '@/stores/shippingInfoStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const { Title } = Typography;

interface ShippingInformationProps {
  // Thay đổi kiểu của onAddressSelected để truyền toàn bộ đối tượng ShippingAddress
  onAddressSelected: (address: ShippingAddress | null) => void;
}

const ShippingInformation: React.FC<ShippingInformationProps> = ({ onAddressSelected }) => {
  const { items: cartItems } = useCart();
  const { currentUser, isLoading: isLoadingUser } = useAuth();
  const userId = currentUser?.id;

  const router = useRouter();
  const pathname = usePathname();

  const { data: savedAddresses, isLoading, isError, refetch } = useShippingAddresses(userId);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const {
    name,
    phone,
    address,
    ward,
    district,
    province,
    setName,
    setPhone,
    setAddress,
    setWard,
    setDistrict,
    setProvince,
    reset: resetShippingInfo,
    selectedSavedAddressId: storedSelectedAddressId,
    setSelectedSavedAddressId,
  } = useShippingInfo();

  const [localSelectedAddressId, setLocalSelectedAddressId] = useState<number | null>(null);
  // ⭐ Thêm state để lưu trữ đối tượng địa chỉ đã chọn ⭐
  const [selectedAddressDetails, setSelectedAddressDetails] = useState<ShippingAddress | null>(null);


  useEffect(() => {
    if (savedAddresses) {
      if (storedSelectedAddressId) {
        const selected = savedAddresses.find((addr) => addr.id === storedSelectedAddressId);
        if (selected) {
          handleSelectSavedAddressInternal(selected.id, selected);
          setLocalSelectedAddressId(selected.id);
          // onAddressSelected(selected.id); // Loại bỏ gọi cũ
        } else {
          resetShippingInfoState();
          setSelectedSavedAddressId(null);
          // onAddressSelected(0); // Loại bỏ gọi cũ
        }
      } else if (savedAddresses.length > 0) {
        const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
        const addressToSelect = defaultAddress || savedAddresses[0];
        handleSelectSavedAddressInternal(addressToSelect.id, addressToSelect);
        setLocalSelectedAddressId(addressToSelect.id);
        setSelectedSavedAddressId(addressToSelect.id);
        // onAddressSelected(addressToSelect.id); // Loại bỏ gọi cũ
      } else {
        resetShippingInfoState();
        setSelectedSavedAddressId(null);
        // onAddressSelected(0); // Loại bỏ gọi cũ
        setIsAddingNewAddress(true);
      }
    } else {
      resetShippingInfoState();
      setSelectedSavedAddressId(null);
      // onAddressSelected(0); // Loại bỏ gọi cũ
      setIsAddingNewAddress(false);
    }
  }, [savedAddresses, storedSelectedAddressId, setSelectedSavedAddressId, resetShippingInfo, isLoadingUser]); // Loại bỏ onAddressSelected khỏi dependencies để tránh loop

  // ⭐ Thêm useEffect để gọi onAddressSelected khi selectedAddressDetails thay đổi ⭐
  useEffect(() => {
    onAddressSelected(selectedAddressDetails);
  }, [selectedAddressDetails, onAddressSelected]);


  const resetShippingInfoState = () => {
    resetShippingInfo();
    setLocalSelectedAddressId(null);
    setSelectedAddressDetails(null); // Reset cả details
  };

  const handleSelectSavedAddressInternal = (addressId: number, addressData: ShippingAddress) => {
    setLocalSelectedAddressId(addressId);
    setIsAddingNewAddress(false);
    setName(addressData.fullName);
    setPhone(addressData.phone);
    setAddress(addressData.address);
    setWard(addressData.ward || null);
    setDistrict(addressData.district || null);
    setProvince(addressData.province || null);
    setSelectedSavedAddressId(addressId);
    setSelectedAddressDetails(addressData); // ⭐ Cập nhật details ở đây ⭐
  };

  const handleSelectSavedAddress = (addressId: number, addressData: ShippingAddress) => {
    handleSelectSavedAddressInternal(addressId, addressData);
  };

  const handleNewAddress = () => {
    // Khi thêm địa chỉ mới, reset các state liên quan đến địa chỉ cũ và
    // thông báo cho component cha rằng hiện tại không có địa chỉ nào được chọn.
    resetShippingInfoState();
    setSelectedSavedAddressId(null); // Đảm bảo trạng thái global cũng được reset
    setIsAddingNewAddress(true);
    // Điều hướng đến trang quản lý địa chỉ để người dùng thêm mới
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/tai-khoan?p=address&returnUrl=${returnUrl}`);
  };

  if (isLoading || isLoadingUser) {
    return <div>Đang tải địa chỉ giao hàng...</div>;
  }

  if (isError) {
    return <div>Lỗi khi tải địa chỉ giao hàng.</div>;
  }

  return (
    <div>
      <Title level={3}>Thông tin giao hàng</Title>

      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Địa chỉ đã lưu</label>
          <Row gutter={16}>
            {savedAddresses.map((addr) => (
              <Col key={addr.id} xs={24} md={12}>
                <div
                  className={`border rounded p-4 mb-2 cursor-pointer relative ${
                    localSelectedAddressId === addr.id ? 'border-blue-500 shadow-md' : 'border-gray-300'
                  }`}
                  onClick={() => handleSelectSavedAddress(addr.id, addr)}
                >
                  {addr.isDefault && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded px-2 py-1">
                      Mặc định
                    </div>
                  )}
                  <div>{addr.fullName}</div>
                  <div>{addr.phone}</div>
                  <div>{addr.address}</div>
                  {addr.ward && <div>{addr.ward}</div>}
                  {addr.district && <div>{addr.district}</div>}
                  {addr.province && <div>{addr.province}</div>}

                  {localSelectedAddressId === addr.id && (
                    <div className="absolute bottom-2 right-2 flex items-center bg-green-500 text-white text-xs rounded-full pr-1 pl-2 py-1">
                      <span className="mr-1">Đang chọn</span>
                      <CheckCircleOutlined className="text-white text-base" />
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <div className="mb-4">
        <Button icon={<PlusOutlined />} onClick={handleNewAddress}>
          Địa chỉ mới
        </Button>
      </div>
    </div>
  );
};

export default ShippingInformation;