'use client';

import {
  Table,
  Image,
  Space,
  Tooltip,
  Button,
  Modal,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { Config } from '@/types/config.type';
import { useConfigOne } from '@/hooks/config/useConfigOne';
import { useUpdateConfig } from '@/hooks/config/useUpdateConfig';
import ConfigUpdateModal from './ConfigUpdateModal';

export default function ConfigTable() {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);

  const { data: configData, isLoading, refetch } = useConfigOne();
  const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateConfig();

  const handleOpenUpdateModal = () => {
    if (configData) {
      setSelectedConfig(configData);
      setOpenUpdate(true);
    }
  };

  const handleUpdateConfig = async (values: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>, logoFile?: File | null) => {
    if (selectedConfig) {
      try {
        await updateConfig({ id: selectedConfig.id, data: values, logoFile });
        message.success('Cập nhật cấu hình thành công');
        refetch();
        setOpenUpdate(false);
      } catch (error: any) {
        message.error(error?.response?.data?.message || 'Cập nhật cấu hình thất bại');
      }
    }
  };

  const columns: ColumnsType<Config> = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="Logo"
            width={80}
            height={40}
            style={{ objectFit: 'contain' }}
            preview={false}
          />
        ) : (
          <span>—</span>
        ),
    },

    {
      title: 'Tên Website',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Địa chỉ Lấy Hàng Mặc Định',
      key: 'pick_up_address', // Dùng một key mới cho cột gộp
      render: (_, record) => { // Dùng render để kết hợp các trường
        const parts = [];
        if (record.pick_address) parts.push(record.pick_address);
        if (record.pick_ward) parts.push(record.pick_ward);
        if (record.pick_district) parts.push(record.pick_district);
        if (record.pick_province) parts.push(record.pick_province);
        return parts.length > 0 ? parts.join(', ') : 'Chưa có';
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={handleOpenUpdateModal}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={configData ? [configData] : []} // Hiển thị một hàng duy nhất nếu có dữ liệu
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />

      {configData && (
        <ConfigUpdateModal
          open={openUpdate}
          onClose={() => setOpenUpdate(false)}
          config={configData}
          onUpdate={handleUpdateConfig}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}