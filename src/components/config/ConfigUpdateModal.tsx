'use client';

import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useUpdateConfig } from '@/hooks/config/useUpdateConfig';
import { Config } from '@/types/config.type';

interface ConfigUpdateModalProps {
  open: boolean;
  onClose: () => void;
  config: Config | null;
  onUpdate: (values: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>, logoFile?: File | null) => void;
  isUpdating: boolean;
}

const ConfigUpdateModal = ({ open, onClose, config, onUpdate, isUpdating }: ConfigUpdateModalProps) => {
  const [form] = Form.useForm();
  const [logoFileList, setLogoFileList] = useState<any[]>([]);

  const validateMobile = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    const phoneRegex = /^(0[2-9]\d{8,9}|[+]84[2-9]\d{8,9})$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject('Số điện thoại không hợp lệ');
    }
    return Promise.resolve();
  };

  useEffect(() => {
    if (config && open) {
      form.setFieldsValue({
        name: config.name,
        email: config.email,
        mobile: config.mobile,
        address: config.address,
        googlemap: config.googlemap,
        facebook: config.facebook,
        zalo: config.zalo,
        instagram: config.instagram,
        tiktok: config.tiktok,
        youtube: config.youtube,
        x: config.x,
        linkedin: config.linkedin,
      });
      setLogoFileList(
        config.logo ? [{ uid: '-1-logo', name: 'logo', status: 'done', url: config.logo }] : []
      );
    } else if (!open) {
      form.resetFields();
      setLogoFileList([]);
    }
  }, [config, open, form]);

  const onFinish = async (values: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const logoFile = logoFileList?.[0]?.originFileObj;
    onUpdate(values, logoFile);
  };


  return (
    <Modal
      title="Cập nhật cấu hình"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên Website" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="mobile"
          rules={[{ validator: validateMobile }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Địa chỉ" name="address">
          <Input />
        </Form.Item>
        <Form.Item label="Google Map" name="googlemap">
          <Input />
        </Form.Item>
        <Form.Item label="Facebook" name="facebook">
          <Input />
        </Form.Item>
        <Form.Item label="Zalo" name="zalo">
          <Input />
        </Form.Item>
        <Form.Item label="Instagram" name="instagram">
          <Input />
        </Form.Item>
        <Form.Item label="Tiktok" name="tiktok">
          <Input />
        </Form.Item>
        <Form.Item label="Youtube" name="youtube">
          <Input />
        </Form.Item>
        <Form.Item label="X (Twitter)" name="x">
          <Input />
        </Form.Item>
        <Form.Item label="LinkedIn" name="linkedin">
          <Input />
        </Form.Item>

        <Form.Item label="Logo">
         <Upload
            listType="picture"
            fileList={logoFileList}
            onChange={({ fileList }) => setLogoFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn Logo</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isUpdating} block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigUpdateModal;