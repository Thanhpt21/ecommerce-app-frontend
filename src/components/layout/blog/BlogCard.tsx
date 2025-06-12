// src/components/layout/blog/BlogCard.tsx
'use client'; // Đánh dấu đây là Client Component nếu cần tương tác client-side

import React from 'react';
import Link from 'next/link';
import { Card } from 'antd'; // Import Card từ Ant Design
import { useLocaleContext } from '@/context/LocaleContext'; // Import context locale

// Đảm bảo Blog type được import đúng đường dẫn
import { Blog } from '@/types/blog.type'; // Giả sử type Blog nằm trong types/blog.type.ts

const { Meta } = Card;

interface BlogCardProps {
  blog: Blog;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const { locale } = useLocaleContext(); // Lấy locale từ context

  return (
    <Link key={blog.id} href={`/${locale}/tin-tuc/${blog.slug}`} passHref>
      <Card
        hoverable
        className="w-full h-full flex flex-col transition-shadow duration-300 hover:shadow-xl"
        cover={
          <img
            alt={blog.title}
            src={blog.thumb || 'https://via.placeholder.com/400x250/cccccc/ffffff?text=No+Image'} // Fallback image
            className="w-full h-48 object-cover rounded-t-lg"
          />
        }
      >
        <Meta
          title={<span className="text-lg font-semibold line-clamp-2">{blog.title}</span>}
          description={
            <>
              <p className="text-gray-600 text-sm line-clamp-3 mb-2">{blog.description}</p>
              <div className="text-xs text-gray-500">
                Ngày đăng: {new Date(blog.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
              </div>
              <div className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
                Đọc thêm &rarr;
              </div>
            </>
          }
        />
      </Card>
    </Link>
  );
};