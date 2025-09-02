// src/components/ShippingAddressList.tsx
'use client';

import { useCurrent } from '@/hooks/auth/useCurrent';
import { useShippingAddresses } from '@/hooks/shipping-address/useShippingAddresses';
import { useCreateShippingAddress } from '@/hooks/shipping-address/useCreateShippingAddress';
import { useUpdateShippingAddress } from '@/hooks/shipping-address/useUpdateShippingAddress';
import { useDeleteShippingAddress } from '@/hooks/shipping-address/useDeleteShippingAddress';
import { useSetDefaultShippingAddress } from '@/hooks/shipping-address/useSetDefaultShippingAddress';
import { List, Button, Tag, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { ShippingAddress as ShippingAddressType } from '@/types/shipping-address.type';
import { useRouter, useSearchParams } from 'next/navigation';

import NewAddressForm from './NewAddressForm'; // Import component form mới

const ShippingAddressList: React.FC = () => {
  const { data: currentUser } = useCurrent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const { data: shippingAddresses, isLoading, isError, refetch } = useShippingAddresses(currentUser?.id);
  const { mutate: createAddress } = useCreateShippingAddress();
  const { mutate: updateAddress } = useUpdateShippingAddress();
  const { mutate: deleteAddress } = useDeleteShippingAddress();
  const { mutate: setDefaultAddress } = useSetDefaultShippingAddress();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddressType | null>(null);

  useEffect(() => {
    // Nếu có returnUrl và không trong chế độ thêm/sửa, tự động mở form thêm mới
    if (returnUrl && !isAddingNew && !editingAddress) {
      handleAddNew();
    }
  }, [returnUrl, isAddingNew, editingAddress]);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingAddress(null); // Đảm bảo không ở chế độ chỉnh sửa
  };

  const handleEdit = (address: ShippingAddressType) => {
    setEditingAddress(address);
    setIsAddingNew(true); // Mở form trong chế độ chỉnh sửa
  };

  const handleSaveNewAddress = (
    newAddressData: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!currentUser?.id) {
      message.error('Bạn cần đăng nhập để thêm địa chỉ.');
      return;
    }

    createAddress(
      { ...newAddressData, userId: currentUser.id },
      {
        onSuccess: () => {
          message.success('Địa chỉ đã được thêm thành công!');
          setIsAddingNew(false);
          refetch().then(() => {
            if (returnUrl) {
              router.push(decodeURIComponent(returnUrl));
            }
          });
        },
        onError: (error: any) => {
          message.error('Thêm địa chỉ thất bại! Vui lòng kiểm tra lại thông tin.');
          console.error('Error creating address:', error);
        },
      }
    );
  };

  const handleUpdateAddress = (
    addressId: number,
    updatedAddressData: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    updateAddress(
      {
        id: addressId,
        data: updatedAddressData,
      },
      {
        onSuccess: () => {
          message.success('Địa chỉ đã được cập nhật thành công!');
          setIsAddingNew(false);
          setEditingAddress(null);
          refetch().then(() => {
            if (returnUrl) {
              router.push(decodeURIComponent(returnUrl));
            }
          });
        },
        onError: (error: any) => {
          message.error('Cập nhật địa chỉ thất bại!');
          console.error('Error updating address:', error);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa địa chỉ',
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      onOk() {
        deleteAddress(id, {
          onSuccess: () => {
            message.success('Địa chỉ đã được xóa thành công!');
            refetch();
          },
          onError: (error: any) => {
            message.error('Xóa địa chỉ thất bại!');
            console.error('Error deleting address:', error);
          },
        });
      },
    });
  };

  const handleSetDefault = (id: number) => {
    setDefaultAddress(
      { id: id, isDefault: true },
      {
        onSuccess: () => {
          message.success('Địa chỉ mặc định đã được thiết lập thành công!');
          refetch();
        },
        onError: (error: any) => {
          message.error('Thiết lập địa chỉ mặc định thất bại!');
          console.error('Error setting default address:', error);
        },
      }
    );
  };

  const handleSaveForm = (
    formData: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingAddress) {
      handleUpdateAddress(editingAddress.id, formData);
    } else {
      handleSaveNewAddress(formData);
    }
  };

  const handleCancelNewAddress = () => {
    setIsAddingNew(false);
    setEditingAddress(null);
    if (returnUrl) {
      router.push(decodeURIComponent(returnUrl));
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isError) {
    return <div>Lỗi khi tải địa chỉ.</div>;
  }

  const isFormActive = isAddingNew;

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
        <Button icon={<PlusOutlined />} onClick={handleAddNew} disabled={isFormActive}>
          Thêm địa chỉ mới
        </Button>
      </div>
      {shippingAddresses && shippingAddresses.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={shippingAddresses}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(item)}
                  disabled={isFormActive && (!editingAddress || editingAddress.id !== item.id)}
                >
                  Chỉnh sửa
                </Button>,
                <Button
                  key="delete"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.id)}
                  danger
                  disabled={isFormActive}
                >
                  Xóa
                </Button>,
                !item.isDefault && (
                  <Button
                    key="default"
                    onClick={() => handleSetDefault(item.id)}
                    disabled={isFormActive}
                  >
                    Đặt làm mặc định
                  </Button>
                ),
                item.isDefault && <Tag color="green">Mặc định</Tag>,
              ]}
            >
              <List.Item.Meta
                title={`${item.fullName} - ${item.phone}`}
                description={
                  `${item.address}` +
                  `${item.ward ? `, ${item.ward}` : ''}` +
                  `${item.district ? `, ${item.district}` : ''}` +
                  `${item.province ? `, ${item.province}` : ''}`
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <p>Bạn chưa thêm địa chỉ nào.</p>
      )}

      {isAddingNew && (
        <NewAddressForm
          onSave={handleSaveForm}
          onCancel={handleCancelNewAddress}
          initialValues={
            editingAddress
              ? {
                  fullName: editingAddress.fullName,
                  phone: editingAddress.phone,
                  address: editingAddress.address,
                  ward: editingAddress.ward,
                  district: editingAddress.district,
                  province: editingAddress.province,
                  isDefault: editingAddress.isDefault,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default ShippingAddressList;