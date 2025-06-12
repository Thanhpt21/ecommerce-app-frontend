// components/account/ShippingAddress.tsx
'use client';

import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('account');
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
        {initialValues ? t('edit_address') : t('add_new_address')}
      </h3>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t('full_name')}
              name="fullName"
              rules={[{ required: true, message: t('please_enter_full_name') as string }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t('phone_number')}
              name="phone"
              rules={[{ required: true, message: t('please_enter_phone_number') as string }]}
            >
              <Input type="tel" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={t('address')}
              name="address"
              rules={[{ required: true, message: t('please_enter_address') as string }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('ward')} name="ward">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('district')} name="district">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('province')} name="province">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="mr-2">
            {t('save_address')}
          </Button>
          <Button onClick={onCancel}>{t('cancel')}</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const ShippingAddress: React.FC = () => {
  const { t } = useTranslation('account');
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

  // Effect to automatically open new address form if returnUrl is present
  useEffect(() => {
    if (returnUrl && !isAddingNew && !editingAddress) {
      handleAddNew();
    }
  }, [returnUrl, isAddingNew, editingAddress]);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingAddress(null); // Reset editing address when adding new
  };

  const handleEdit = (address: ShippingAddressType) => {
    setEditingAddress(address);
    setIsAddingNew(true); // Set to true to show the form
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
          message.success(t('address_added_success') as string);
          setIsAddingNew(false);
          refetch().then(() => {
            if (returnUrl) {
              router.push(decodeURIComponent(returnUrl));
            }
          });
        },
        onError: (error: any) => {
          message.error(t('address_added_failed') as string);
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
          message.success(t('address_updated_success') as string);
          setIsAddingNew(false);
          setEditingAddress(null);
          refetch().then(() => {
            if (returnUrl) {
              router.push(decodeURIComponent(returnUrl));
            }
          });
        },
        onError: (error: any) => {
          message.error(t('address_updated_failed') as string);
          console.error('Error updating address:', error);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: t('confirm_delete_address') as string,
      content: t('are_you_sure_delete') as string,
      onOk() {
        deleteAddress(id, {
          onSuccess: () => {
            message.success(t('address_deleted_success') as string);
            refetch();
          },
          onError: (error: any) => {
            message.error(t('address_deleted_failed') as string);
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
          message.success(t('default_address_set_success') as string);
          refetch();
        },
        onError: (error: any) => {
          message.error(t('default_address_set_failed') as string);
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
    return <div>{t('loading')}...</div>;
  }

  if (isError) {
    return <div>{t('error_loading_addresses')}</div>;
  }

  // Determine if any form is active (adding new or editing existing)
  const isFormActive = isAddingNew; // isAddingNew covers both adding and editing states

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('shipping_address')}</h2>
        {/* Disable "Add New Address" button if a form is active */}
        <Button icon={<PlusOutlined />} onClick={handleAddNew} disabled={isFormActive}>
          {t('add_new_address')}
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
                  // Disable if another form is active OR if this is not the address being edited
                  disabled={isFormActive && (!editingAddress || editingAddress.id !== item.id)}
                >
                  {t('edit')}
                </Button>,
                <Button
                  key="delete"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.id)}
                  danger
                  // Disable if any form is active (adding or editing)
                  disabled={isFormActive}
                >
                  {t('delete')}
                </Button>,
                !item.isDefault && (
                  <Button
                    key="default"
                    onClick={() => handleSetDefault(item.id)}
                    // Disable if any form is active (adding or editing)
                    disabled={isFormActive}
                  >
                    {t('set_as_default')}
                  </Button>
                ),
                item.isDefault && <Tag color="green">{t('default')}</Tag>,
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
        <p>{t('no_address_added')}</p>
      )}

      {isAddingNew && ( // isAddingNew is true for both adding and editing
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