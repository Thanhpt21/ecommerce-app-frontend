'use client';

import { useTranslation } from 'react-i18next';
import { useCurrent, CurrentUser } from '@/hooks/auth/useCurrent';
import { useUpdateUser } from '@/hooks/user/useUpdateUser';
import { Form, Input, Button, message, Avatar, Upload, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

interface UploadFile extends File {
  uid?: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
}

const PersonalInfo = () => {
  const { t } = useTranslation('account');
  const { data: currentUser, isLoading, isError, refetch: refetchCurrentUser } = useCurrent();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber || '',
        gender: currentUser.gender || null,
      });
      setProfileImage(currentUser.profilePicture || null);
    }
  }, [currentUser, form]);

  const onValuesChange = () => {
    setHasChanges(true);
  };

  const handleImageChange = (info: any) => {
    if (info.file.status === 'uploading') {
      // Bạn có thể hiển thị trạng thái tải ảnh ở đây
      return;
    }
    if (info.file.status === 'done') {
      // Khi upload xong, bạn có thể lấy URL từ response (nếu backend trả về)
      // Hoặc bạn có thể đọc file trực tiếp ở client để hiển thị preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
      setUploadFile(info.file.originFileObj as UploadFile);
      setHasChanges(true);
    } else if (info.file.status === 'error') {
      message.error(t('upload_failed') as string);
    }
  };

  const onFinish = (values: any) => {
    if (currentUser?.id) {
      const formData = { ...values };
      let fileToSend: File | undefined = uploadFile || undefined;

      updateUser(
        { id: currentUser.id, data: formData, file: fileToSend },
        {
          onSuccess: () => {
            message.success(t('update_success') as string);
            setHasChanges(false);
            setUploadFile(null);
            refetchCurrentUser(); // Refresh dữ liệu người dùng
          },
          onError: (error: any) => {
            message.error(t('update_failed') as string);
            console.error('Update failed:', error);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div>{t('loading')}...</div>;
  }

  if (isError || !currentUser) {
    return <div>{t('error_loading_info')}</div>;
  }

  const uploadProps = {
    name: 'file',
    action: '/api/upload', // Thay thế bằng API upload ảnh của bạn
    headers: {
      // Thêm header authorization nếu cần
    },
    onChange: handleImageChange,
    showUploadList: false,
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('personal_info')}</h2>

      <div className="flex items-center mb-4">
        <Avatar size={80} src={profileImage} />
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} className="ml-4">
            {t('change_avatar')}
          </Button>
        </Upload>
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={onValuesChange}
        onFinish={onFinish}
        initialValues={{ gender: currentUser.gender }} // Set initial value for gender
      >
        <Form.Item label={t('name')} name="name">
          <Input />
        </Form.Item>
        <Form.Item label={t('email')} name="email">
          <Input disabled />
        </Form.Item>
        <Form.Item label={t('phone_number')} name="phoneNumber">
          <Input />
        </Form.Item>
        <Form.Item label={t('gender')} name="gender">
          <Radio.Group>
            <Radio value={null}>{t('not_specified')}</Radio>
            <Radio value="male">{t('male')}</Radio>
            <Radio value="female">{t('female')}</Radio>
            <Radio value="other">{t('other')}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!hasChanges}
            loading={isUpdating}
          >
            {t('update')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PersonalInfo;