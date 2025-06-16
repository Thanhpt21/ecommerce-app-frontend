'use client';

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
      return;
    }
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
      setUploadFile(info.file.originFileObj as UploadFile);
      setHasChanges(true);
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh thất bại');
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
            message.success('Cập nhật thành công!');
            setHasChanges(false);
            setUploadFile(null);
            refetchCurrentUser();
          },
          onError: (error: any) => {
            message.error('Cập nhật thất bại!');
            console.error('Update failed:', error);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isError || !currentUser) {
    return <div>Lỗi khi tải thông tin.</div>;
  }

  const uploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {},
    onChange: handleImageChange,
    showUploadList: false,
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>

      <div className="flex items-center mb-4">
        <Avatar size={80} src={profileImage} />
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} className="ml-4">
            Đổi ảnh đại diện
          </Button>
        </Upload>
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={onValuesChange}
        onFinish={onFinish}
        initialValues={{ gender: currentUser.gender }}
      >
        <Form.Item label="Họ và tên" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phoneNumber">
          <Input />
        </Form.Item>
        <Form.Item label="Giới tính" name="gender">
          <Radio.Group>
            <Radio value={null}>Không xác định</Radio>
            <Radio value="male">Nam</Radio>
            <Radio value="female">Nữ</Radio>
            <Radio value="other">Khác</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!hasChanges}
            loading={isUpdating}
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PersonalInfo;