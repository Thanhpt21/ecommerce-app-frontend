'use client';

import { useCurrent } from '@/hooks/auth/useCurrent';
import { useShippingAddresses } from '@/hooks/shipping-address/useShippingAddresses';
import { useCreateShippingAddress } from '@/hooks/shipping-address/useCreateShippingAddress';
import { useUpdateShippingAddress } from '@/hooks/shipping-address/useUpdateShippingAddress';
import { useDeleteShippingAddress } from '@/hooks/shipping-address/useDeleteShippingAddress';
import { useSetDefaultShippingAddress } from '@/hooks/shipping-address/useSetDefaultShippingAddress';
import { List, Button, Tag, Input, Row, Col, message, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { CreateShippingAddressPayload, ShippingAddress as ShippingAddressType } from '@/types/shipping-address.type';
import { useRouter, useSearchParams } from 'next/navigation';

interface NewAddressFormProps {
  onSave: (
    addressData: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
      isDefault?: boolean;
    }
  ) => void;
  onCancel: () => void;
  initialValues?: ShippingAddressType;
}

const NewAddressForm: React.FC<NewAddressFormProps> = ({ onSave, onCancel, initialValues }) => {
  const [form] = Form.useForm();

  const onFinish = (
    values: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
      isDefault?: boolean;
    }
  ) => {
    onSave(values);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4">
        {initialValues ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
      </h3>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input type="tel" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Phường/Xã" name="ward">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Quận/Huyện" name="district">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Tỉnh/Thành phố" name="province">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="mr-2">
            Lưu địa chỉ
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const ShippingAddress: React.FC = () => {
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
    if (returnUrl && !isAddingNew && !editingAddress) {
      handleAddNew();
    }
  }, [returnUrl, isAddingNew, editingAddress]);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingAddress(null);
  };

  const handleEdit = (address: ShippingAddressType) => {
    setEditingAddress(address);
    setIsAddingNew(true);
  };

  const handleSaveNewAddress = (
    newAddressData: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
      isDefault?: boolean;
    }
  ) => {
    if (!currentUser?.id) return;
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
          message.error('Thêm địa chỉ thất bại!');
          console.error('Error creating address:', error);
        },
      }
    );
  };

  const handleUpdateAddress = (
    updatedAddressData: Omit<ShippingAddressType, 'userId' | 'createdAt' | 'updatedAt'> & {
      isDefault?: boolean;
    }
  ) => {
    if (!editingAddress?.id) return;
    updateAddress(
      { id: editingAddress.id, data: updatedAddressData },
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
    formData: Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
      isDefault?: boolean;
    }
  ) => {
    if (editingAddress) {
      handleUpdateAddress({ ...formData, id: editingAddress.id });
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
                description={`${item.address}${item.ward ? `, ${item.ward}` : ''}${item.district ? `, ${item.district}` : ''}${item.province ? `, ${item.province}` : ''}`}
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
          initialValues={editingAddress ?? undefined}
        />
      )}
    </div>
  );
};

export default ShippingAddress;