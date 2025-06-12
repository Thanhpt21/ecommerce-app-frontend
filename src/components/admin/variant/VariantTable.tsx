'use client';

import {
  Table,
  Image,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useParams } from 'next/navigation';

import { useVariants } from '@/hooks/variant/useVariants'; // Hook lấy danh sách biến thể
import { useAllColors } from '@/hooks/color/useAllColors';
import { useAllSizes } from '@/hooks/size/useAllSizes';
import { formatVND } from '@/utils/helpers';
import { Variant } from '@/types/variant.type';
import { VariantCreateModal } from './VariantCreateModal';
import { VariantUpdateModal } from './VariantUpdateModal';
import { useDeleteVariant } from '@/hooks/variant/useDeleteVariant';

interface Props {
  productId?: string; // Nhận productId nếu trang này hiển thị biến thể của một sản phẩm cụ thể
}

export default function VariantTable({ productId: propProductId }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const { push } = useRouter();
  const { productId: routeProductId } = useParams();

  // Ép kiểu cho routeProductId
  const currentProductId: string | number | undefined =
    propProductId || (typeof routeProductId === 'string' ? routeProductId : undefined);

  const { data, isLoading, refetch } = useVariants({
    page,
    limit: 10,
    search,
    productId: currentProductId, // Sử dụng currentProductId đã ép kiểu
  });
  const { mutateAsync: deleteVariant, isPending: isDeleting } = useDeleteVariant();

  // Gọi các hook useAll cần thiết cho Variant
  const { data: allColors, isLoading: isLoadingColors, error: errorColors } = useAllColors();
  const { data: allSizes, isLoading: isLoadingSizes, error: errorSizes } = useAllSizes();

  const columns: ColumnsType<Variant> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumb',
      key: 'thumb',
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="Thumb"
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
      title: 'Tên biến thể',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Giá / Giảm giá',
      key: 'price',
      align: 'center',
      width: 300,
      render: (record) => (
        <div>
          <span>{formatVND(record.price)}</span> / 
          {record.discount > 0 && (
            <span style={{ color: 'gray', fontSize: '0.8em' }}>
              -({formatVND(record.discount)})
            </span>
          )}
        </div>
      ),
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
                setSelectedVariant(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá biến thể',
                  content: `Bạn có chắc chắn muốn xoá biến thể này không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteVariant(record.id);
                      message.success('Xoá biến thể thành công');
                      refetch();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại');
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  useEffect(() => {
    setPage(1); // Reset page khi productId thay đổi (nếu có)
    refetch();
  }, [currentProductId, search, refetch]);

  if (isLoading || isLoadingColors || isLoadingSizes) {
    return <div>Đang tải dữ liệu biến thể...</div>;
  }

  if (errorColors || errorSizes) {
    return <div>Lỗi khi tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm biến thể..."
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

      <VariantCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        productId={currentProductId}
        colors={allColors || []}
        sizes={allSizes || []}
      />

      <VariantUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        variant={selectedVariant}
        refetch={refetch}
        productId={currentProductId}
        colors={allColors || []}
        sizes={allSizes || []}
      />
    </div>
  );
}