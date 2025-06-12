'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Tag,
  Select, // Import Select
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Blog } from '@/types/blog.type';
import { useBlogs } from '@/hooks/blog/useBlogs';
import { useDeleteBlog } from '@/hooks/blog/useDeleteBlog';
import Link from 'next/link';
import { BlogCreateModal } from './BlogCreateModal';
import { BlogUpdateModal } from './BlogUpdateModal';
import { useAllBlogCategories } from '@/hooks/blog-category/useAllBlogCategories';
import { BlogCategory } from '@/types/blog-category.type';

export default function BlogTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined); // State cho filter category

  const { data, isLoading, refetch } = useBlogs({ page, limit: 10, search, categoryId: filterCategoryId });
  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { data: categories, isLoading: isCategoriesLoading } = useAllBlogCategories();

  const columns: ColumnsType<Blog> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumb',
      key: 'thumb',
      width: 100,
      render: (thumb: string) => (
        <img src={thumb} alt="Thumbnail" style={{ maxWidth: '100%', height: 'auto' }} />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Blog) => <Link href={`/blogs/${record.slug}`} target="_blank">{text}</Link>,
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'title'],
      key: 'category',
    },
    {
      title: 'Người đăng',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
    },
      {
      title: 'Xuất bản',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'red'}>
          {isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
        </Tag>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'numberViews',
      key: 'numberViews',
      sorter: (a, b) => a.numberViews - b.numberViews,
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
                setSelectedBlog(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa blog',
                  content: `Bạn có chắc chắn muốn xóa blog "${record.title}" không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteBlog(record.id);
                      message.success('Xóa blog thành công');
                      refetch();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xóa thất bại');
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

  const handleCategoryFilterChange = (value: number | undefined) => {
    setFilterCategoryId(value);
    setPage(1); // Reset page khi thay đổi filter
  };

  // Refetch data khi filterCategoryId thay đổi
  useEffect(() => {
    refetch();
  }, [filterCategoryId, refetch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 200 }}
            loading={isCategoriesLoading}
            onChange={handleCategoryFilterChange}
            allowClear
          >
            {categories?.map((cat: BlogCategory) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.title}
              </Select.Option>
            ))}
          </Select>
          <Input
            placeholder="Tìm kiếm blog..."
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
        loading={isLoading || isCategoriesLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <BlogCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <BlogUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        blog={selectedBlog}
        refetch={refetch}
      />
    </div>
  );
}