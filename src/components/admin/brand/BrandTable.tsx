'use client'

import {
  Table,
  Image,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useState } from 'react'

import { Brand } from '@/types/brand.type'
import { useBrands } from '@/hooks/brand/useBrands'
import { useDeleteBrand } from '@/hooks/brand/useDeleteBrand'
import { BrandCreateModal } from './BrandCreateModal'
import { BrandUpdateModal } from './BrandUpdateModal'

export default function BrandTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

  const { data, isLoading, refetch } = useBrands({ page, limit: 10, search })
  const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand()

  const columns: ColumnsType<Brand> = [
    {
        title: 'STT',
        key: 'index',
        width: 60,
        render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="Logo"
            width={40}
            height={40}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <span>—</span>
        ),
    },
    {
      title: 'Tên thương hiệu',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedBrand(record)
                setOpenUpdate(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá thương hiệu',
                  content: `Bạn có chắc chắn muốn xoá thương hiệu "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteBrand(record.id)
                      message.success('Xoá thương hiệu thành công')
                      refetch()
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại')
                    }
                  },
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Tạo mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <BrandCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <BrandUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        brand={selectedBrand}
        refetch={refetch}
      />
    </div>
  )
}
