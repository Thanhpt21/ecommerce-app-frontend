// components/checkout/ShippingInformation.tsx (or wherever your ShippingInformation component is)
'use client';

import { Input, Button, Typography, Row, Col, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import useCart from '@/stores/cartStore';
import { ShippingAddress } from '@/types/shipping-address.type';
import { useShippingAddresses } from '@/hooks/shipping-address/useShippingAddresses';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import useShippingInfo from '@/stores/shippingInfoStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation'; // Import useRouter and usePathname
import { useLocaleContext } from '@/context/LocaleContext'; // Assuming you have a LocaleContext

const { Title } = Typography;

// Định nghĩa props cho component ShippingInformation
interface ShippingInformationProps {
  onAddressSelected: (addressId: number) => void;
}

const ShippingInformation: React.FC<ShippingInformationProps> = ({ onAddressSelected }) => {
  const { t } = useTranslation('checkout');
  const { items: cartItems } = useCart();
  const { currentUser, isLoading: isLoadingUser } = useAuth();
  const userId = currentUser?.id;

  const router = useRouter(); // Initialize useRouter
  const pathname = usePathname(); // Get current pathname
  const { locale } = useLocaleContext(); // Get current locale

  const { data: savedAddresses, isLoading, isError, refetch } = useShippingAddresses(userId);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false); // This state will now primarily control form visibility when there are no saved addresses
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
        // No saved addresses, default to adding new address form
        resetShippingInfoState();
        setSelectedSavedAddressId(null);
        onAddressSelected(0);
        setIsAddingNewAddress(true); // Automatically show new address form if no saved addresses
      }
    } else {
      resetShippingInfoState();
      setSelectedSavedAddressId(null);
      onAddressSelected(0);
      setIsAddingNewAddress(false); // Ensure form is not shown if addresses are still loading or error
    }
  }, [savedAddresses, storedSelectedAddressId, setSelectedSavedAddressId, resetShippingInfo, onAddressSelected, isLoadingUser]); // Added isLoadingUser to dependencies for complete auth status

  const resetShippingInfoState = () => {
    resetShippingInfo();
    setLocalSelectedAddressId(null);
    // setIsAddingNewAddress(false); // This state is now managed differently based on savedAddresses.length
  };

  const handleSelectSavedAddressInternal = (addressId: number, addressData: ShippingAddress) => {
    setLocalSelectedAddressId(addressId);
    setIsAddingNewAddress(false); // No longer adding new address, switch to selected saved
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

  // Modified to redirect to the account address page
  const handleNewAddress = () => {
    // Construct the return URL to come back to the current checkout page
    const returnUrl = encodeURIComponent(pathname);
    // Redirect to the account address page with a parameter to open the address section
    // And pass the returnUrl
    router.push(`/${locale}/tai-khoan?p=address&returnUrl=${returnUrl}`);
  };

  // This function is no longer needed in this component as address saving happens on the account page
  // const handleSaveNewAddress = async () => { /* ... */ };


  if (isLoading || isLoadingUser) { // Added isLoadingUser to overall loading state
    return <div>{t('loading_shipping_addresses')}...</div>;
  }

  if (isError) {
    return <div>{t('error_loading_shipping_addresses')}</div>;
  }

  return (
    <div>
      <Title level={3}>{t('shipping_information')}</Title>

      {/* Only show saved addresses section if there are addresses */}
      {savedAddresses && savedAddresses.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">{t('saved_addresses')}</label>
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
                      {t('default')}
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
          {t('new_address')}
        </Button>
      </div>

      {/* Show the form only if no saved addresses are selected or if there are no saved addresses at all */}
      {(!localSelectedAddressId || (savedAddresses && savedAddresses.length === 0)) && (
        <div>
          <Title level={4} className="mb-4 mt-8">{t('enter_new_address_details')}</Title> {/* New title for clarity */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  {t('name')}
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('your_name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  {t('phone_number')}
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('your_phone_number')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </Col>
            <Col span={24}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  {t('shipping_address')}
                </label>
                <Input.TextArea
                  id="address"
                  rows={4}
                  placeholder={t('your_shipping_address')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ward">
                  {t('ward')}
                </label>
                <Input
                  id="ward"
                  type="text"
                  placeholder={t('your_ward')}
                  value={ward || ''}
                  onChange={(e) => setWard(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
                  {t('district')}
                </label>
                <Input
                  id="district"
                  type="text"
                  placeholder={t('your_district')}
                  value={district || ''}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
                  {t('province')}
                </label>
                <Input
                  id="province"
                  type="text"
                  placeholder={t('your_province')}
                  value={province || ''}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
            </Col>
          </Row>
          {/* No "Save Address" button here, as the address is entered in the checkout flow, not saved to user's addresses */}
          {/* The values from this form are handled by the parent component (checkout page) */}
        </div>
      )}
    </div>
  );
};

export default ShippingInformation;