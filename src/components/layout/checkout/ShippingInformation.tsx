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
  onAddressSelected: (addressId: number) => void;
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

  useEffect(() => {
    if (savedAddresses) {
      if (storedSelectedAddressId) {
        const selected = savedAddresses.find((addr) => addr.id === storedSelectedAddressId);
        if (selected) {
          handleSelectSavedAddressInternal(selected.id, selected);
          setLocalSelectedAddressId(selected.id);
          onAddressSelected(selected.id);
        } else {
          resetShippingInfoState();
          setSelectedSavedAddressId(null);
          onAddressSelected(0);
        }
      } else if (savedAddresses.length > 0) {
        const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
        const addressToSelect = defaultAddress || savedAddresses[0];
        handleSelectSavedAddressInternal(addressToSelect.id, addressToSelect);
        setLocalSelectedAddressId(addressToSelect.id);
        setSelectedSavedAddressId(addressToSelect.id);
        onAddressSelected(addressToSelect.id);
      } else {
        resetShippingInfoState();
        setSelectedSavedAddressId(null);
        onAddressSelected(0);
        setIsAddingNewAddress(true);
      }
    } else {
      resetShippingInfoState();
      setSelectedSavedAddressId(null);
      onAddressSelected(0);
      setIsAddingNewAddress(false);
    }
  }, [savedAddresses, storedSelectedAddressId, setSelectedSavedAddressId, resetShippingInfo, onAddressSelected, isLoadingUser]);

  const resetShippingInfoState = () => {
    resetShippingInfo();
    setLocalSelectedAddressId(null);
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
    onAddressSelected(addressId);
  };

  const handleSelectSavedAddress = (addressId: number, addressData: ShippingAddress) => {
    handleSelectSavedAddressInternal(addressId, addressData);
  };

  const handleNewAddress = () => {
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

      {(!localSelectedAddressId || (savedAddresses && savedAddresses.length === 0)) && (
        <div>
          <Title level={4} className="mb-4 mt-8">Nhập chi tiết địa chỉ mới</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Tên
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Số điện thoại
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Số điện thoại của bạn"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </Col>
            <Col span={24}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Địa chỉ giao hàng
                </label>
                <Input.TextArea
                  id="address"
                  rows={4}
                  placeholder="Địa chỉ giao hàng của bạn"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ward">
                  Phường/Xã
                </label>
                <Input
                  id="ward"
                  type="text"
                  placeholder="Phường/Xã của bạn"
                  value={ward || ''}
                  onChange={(e) => setWard(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
                  Quận/Huyện
                </label>
                <Input
                  id="district"
                  type="text"
                  placeholder="Quận/Huyện của bạn"
                  value={district || ''}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
                  Tỉnh/Thành phố
                </label>
                <Input
                  id="province"
                  type="text"
                  placeholder="Tỉnh/Thành phố của bạn"
                  value={province || ''}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default ShippingInformation;