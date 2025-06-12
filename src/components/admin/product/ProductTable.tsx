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
  Select, // Import Select
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Product } from '@/types/product.type';
import { useProducts } from '@/hooks/product/useProducts';
import { useDeleteProduct } from '@/hooks/product/useDeleteProduct';
import { ProductCreateModal } from './ProductCreateModal';
import { ProductUpdateModal } from './ProductUpdateModal';
import { useAllColors } from '@/hooks/color/useAllColors';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { useAllBrands } from '@/hooks/brand/useAllBrands';
import { useAllSizes } from '@/hooks/size/useAllSizes';
import { formatVND } from '@/utils/helpers';
import { Category } from '@/types/category.type'; // Import Category type

export default function ProductTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined); // State cho filter category

  const { push } = useRouter();

  const { data, isLoading, refetch } = useProducts({ page, limit: 10, search, categoryId: filterCategoryId });
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const { data: allColors, isLoading: isLoadingColors, error: errorColors } = useAllColors();
  const { data: allCategories, isLoading: isLoadingCategories, error: errorCategories } = useAllCategories();
  const { data: allBrands, isLoading: isLoadingBrands, error: errorBrands } = useAllBrands();
  const { data: allSizes, isLoading: isLoadingSizes, error: errorSizes } = useAllSizes();

  const columns: ColumnsType<Product> = [
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
      title: 'Tên sản phẩm',
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
      title: 'Danh mục / Thương hiệu',
      key: 'categoryBrand',
      align: 'center',
      render: (record) => (
        <span>
          {record.category?.title || '—'} / {record.brand?.title || '—'}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedProduct(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá sản phẩm',
                  content: `Bạn có chắc chắn muốn xoá sản phẩm "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteProduct(record.id);
                      message.success('Xoá sản phẩm thành công');
                      refetch();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại');
                    }
                  },
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Biến thể">
            <SkinOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                push(`variant/${record.id}?page=${page}`);
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

  const handleCategoryFilterChange = (value: number | undefined) => {
    setFilterCategoryId(value);
    setPage(1); // Reset page khi thay đổi filter
  };

  useEffect(() => {
    refetch();
  }, [filterCategoryId, refetch]);

  if (isLoading || isLoadingColors || isLoadingCategories || isLoadingBrands || isLoadingSizes) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (errorColors || errorCategories || errorBrands) {
    return <div>Lỗi khi tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 200 }}
            loading={isLoadingCategories}
            onChange={handleCategoryFilterChange}
            allowClear
          >
            {allCategories?.map((cat: Category) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.title}
              </Select.Option>
            ))}
          </Select>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
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
        loading={isLoading || isLoadingCategories}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: Number(process.env.NEXT_PUBLIC_PAGE_SIZE),
          onChange: (p) => setPage(p),
        }}
      />

      <ProductCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        colors={allColors || []}
        categories={allCategories || []}
        brands={allBrands || []}
        sizes={allSizes || []}
      />

      <ProductUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        product={selectedProduct}
        refetch={refetch}
        colors={allColors || []}
        categories={allCategories || []}
        brands={allBrands || []}
        sizes={allSizes || []}
      />
    </div>
  );
}