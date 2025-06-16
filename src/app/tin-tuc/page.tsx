'use client';

import React from 'react';
import Link from 'next/link';
import { Spin, Input, Empty, Breadcrumb, Select } from 'antd';

import { useState, useMemo } from 'react';
import { useAllBlogs } from '@/hooks/blog/useAllBlogs';

import { BlogCard } from '@/components/layout/blog/BlogCard';

const { Search } = Input;
const { Option } = Select;

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const { data: blogs, isLoading, isError } = useAllBlogs(searchTerm, sortBy);

  const publishedBlogs = useMemo(() => {
    return blogs?.filter(blog => blog.isPublished) || [];
  }, [blogs]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value: 'newest' | 'oldest') => {
    setSortBy(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải tin tức..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-xl">
        Đã có lỗi xảy ra khi tải tin tức. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Tin tức
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:justify-between items-center gap-4">
        <Search
          placeholder="Tìm kiếm theo tiêu đề"
          allowClear
          enterButton="Tìm kiếm"
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
          className="w-full md:w-auto"
        />
        <Select
          defaultValue="newest"
          style={{ width: 120 }}
          size="large"
          onChange={handleSortChange}
          value={sortBy}
        >
          <Option value="newest">Mới nhất</Option>
          <Option value="oldest">Cũ nhất</Option>
        </Select>
      </div>

      {publishedBlogs.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-xl text-gray-600">
              Không tìm thấy bài viết nào phù hợp.
            </span>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publishedBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}