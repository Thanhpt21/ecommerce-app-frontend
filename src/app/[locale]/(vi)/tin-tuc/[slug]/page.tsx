// app/[locale]/(vi)/tin-tuc/[slug]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Spin, Empty, Divider, Typography, Breadcrumb, Card, message } from 'antd'; // Import message for notifications
import {
  UserOutlined,
  EyeOutlined,
  CalendarOutlined,
  LikeOutlined,
  DislikeOutlined,
} from '@ant-design/icons';

import { useBlogBySlug } from '@/hooks/blog/useBlogBySlug';
import { useAllBlogs } from '@/hooks/blog/useAllBlogs';
import { useLocaleContext } from '@/context/LocaleContext';
// Import các hooks like/dislike
import { useLikeBlog } from '@/hooks/blog/useLikeBlog';
import { useDislikeBlog } from '@/hooks/blog/useDislikeBlog';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { locale } = useLocaleContext();

  const { data: blog, isLoading, isError } = useBlogBySlug({ slug });
  const { data: allBlogs, isLoading: isLoadingAllBlogs } = useAllBlogs();

  // Khởi tạo mutations
  const likeMutation = useLikeBlog();
  const dislikeMutation = useDislikeBlog();

  const displayedBlog = blog?.isPublished ? blog : null;

  const relatedBlogs = allBlogs
    ?.filter(b => b.slug !== slug && b.isPublished)
    .slice(0, 3);

  // Xử lý khi click vào icon Like
  const handleLike = async () => {
    if (!displayedBlog) return;
    try {
      await likeMutation.mutateAsync(displayedBlog.id);
    } catch (error) {
      console.error('Lỗi khi thích bài viết:', error);
      message.error('Không thể thích bài viết. Vui lòng thử lại.');
    }
  };

  // Xử lý khi click vào icon Dislike
  const handleDislike = async () => {
    if (!displayedBlog) return;
    try {
      await dislikeMutation.mutateAsync(displayedBlog.id);
    } catch (error) {
      console.error('Lỗi khi bỏ thích bài viết:', error);
      message.error('Không thể bỏ thích bài viết. Vui lòng thử lại.');
    }
  };

  if (isLoading || isLoadingAllBlogs) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải bài viết..." />
      </div>
    );
  }

  if (isError || !displayedBlog) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-xl text-gray-600">
              Không tìm thấy bài viết này hoặc bài viết chưa được công bố.
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      {/* Breadcrumb Ant Design */}
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href={`/${locale}`}>Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/${locale}/tin-tuc`}>Tin tức</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {displayedBlog.title}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Phần chính: Chi tiết bài viết (Bên trái) */}
        <div className="flex-1 lg:w-2/3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center lg:text-left mb-6 leading-tight text-gray-900">
            {displayedBlog.title}
          </h1>

          {/* Thông tin bài viết */}
          <div className="flex flex-wrap justify-center lg:justify-start items-center text-gray-600 text-sm mb-8">
            <div className="flex items-center mr-4 mb-2">
              <img
                src={displayedBlog.createdBy?.profilePicture || 'https://via.placeholder.com/30'}
                alt={displayedBlog.createdBy?.name || 'Tác giả'}
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
              <span>Bởi {displayedBlog.createdBy?.name || 'Ẩn danh'}</span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <span>Ngày đăng: {new Date(displayedBlog.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <span>Lượt xem: {displayedBlog.numberViews}</span>
            </div>
            {/* Like Button */}
            <div
              className={`flex items-center mr-4 mb-2 cursor-pointer ${
                displayedBlog.hasLiked ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}
              onClick={handleLike}
              // Disable khi đang loading hoặc khi đã like/dislike để tránh gửi nhiều request
              style={{ pointerEvents: likeMutation.isPending || displayedBlog.hasLiked ? 'none' : 'auto' }}
            >
              <LikeOutlined className="mr-1" />
              <span>{displayedBlog.likesCount}</span>
            </div>
            {/* Dislike Button */}
            <div
              className={`flex items-center mb-2 cursor-pointer ${
                displayedBlog.hasDisliked ? 'text-red-600 font-semibold' : 'text-gray-500'
              }`}
              onClick={handleDislike}
              // Disable khi đang loading hoặc khi đã like/dislike để tránh gửi nhiều request
              style={{ pointerEvents: dislikeMutation.isPending || displayedBlog.hasDisliked ? 'none' : 'auto' }}
            >
              <DislikeOutlined className="mr-1" />
              <span>{displayedBlog.dislikesCount}</span>
            </div>
          </div>

          {/* Ảnh thumbnail */}
          {displayedBlog.thumb && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img
                src={displayedBlog.thumb}
                alt={displayedBlog.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Mô tả ngắn */}
          {displayedBlog.description && (
            <Paragraph className="text-lg text-gray-700 leading-relaxed mb-8">
              {displayedBlog.description}
            </Paragraph>
          )}

          <Divider />

          {/* Nội dung bài viết */}
          <div className="blog-content">
            {displayedBlog.content && displayedBlog.content.length > 0 ? (
              displayedBlog.content.map((item, index) => (
                <div key={index} className="mb-8">
                  {item.title && (
                    <Title level={2} className="text-3xl font-bold mb-4 text-gray-800">
                      {item.title}
                    </Title>
                  )}
                  {item.body && (
                    <div
                      className="prose prose-lg max-w-none text-gray-800"
                      dangerouslySetInnerHTML={{ __html: item.body }}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg">Nội dung bài viết đang được cập nhật.</p>
            )}
          </div>

          {/* Các thông tin khác như category (tùy chọn) */}
          {displayedBlog.category && (
            <div className="mt-10 text-center lg:text-left text-gray-600">
              <Link href={`/${locale}/tin-tuc?category=${displayedBlog.category.slug}`} className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-200 transition-colors">
                Danh mục: {displayedBlog.category.title}
              </Link>
            </div>
          )}
        </div>

        {/* Phần phụ: Bài viết khác (Bên phải) */}
        <div className="lg:w-1/3 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Bài viết liên quan</h2>
          {relatedBlogs && relatedBlogs.length > 0 ? (
            <div className="space-y-6">
              {relatedBlogs.map(rb => (
                <Link key={rb.id} href={`/${locale}/tin-tuc/${rb.slug}`} passHref>
                  <div className="flex items-start bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Ảnh thumbnail - nằm ngang bên trái */}
                    <img
                      alt={rb.title}
                      src={rb.thumb || 'https://via.placeholder.com/120x80/cccccc/ffffff?text=No+Image'}
                      className="w-24 h-20 object-cover rounded-md flex-shrink-0 mr-4"
                    />
                    {/* Tiêu đề và thông tin - nằm bên phải */}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                        {rb.title}
                      </h3>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                        {/* Tên người đăng */}
                        <div className="flex items-center">
                          <UserOutlined className="mr-1" />
                          <span>{rb.createdBy?.name || 'Ẩn danh'}</span>
                        </div>
                        {/* Lượt xem */}
                        <div className="flex items-center">
                          <EyeOutlined className="mr-1" />
                          <span>{rb.numberViews}</span>
                        </div>
                        {/* Ngày đăng */}
                        <div className="flex items-center">
                          <CalendarOutlined className="mr-1" />
                          <span>{new Date(rb.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Không có bài viết liên quan nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}