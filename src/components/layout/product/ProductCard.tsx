'use client';

import React, { useState } from 'react'; // Import useState
import Image from 'next/image';
import Link from 'next/link';
import { Card, Tag, Tooltip, message } from 'antd';
import { Eye, Heart, Star } from 'lucide-react';
import { Product } from '@/types/product.type';
import { formatVND } from '@/utils/helpers';
import { useWishlist } from '@/stores/useWishlistStore';
import ProductQuickViewModal from './ProductQuickViewModal'; // Import modal mới

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const [isModalVisible, setIsModalVisible] = useState(false); // State để điều khiển Modal

  const isProductInWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlistItem = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      thumb: product.thumb,
      price: product.price,
      discount: product.discount,
      averageRating: product.averageRating,
      ratingCount: product.ratingCount,
    };

    toggleItem(wishlistItem);

    if (isProductInWishlist) {
      message.success(`Đã xóa "${product.title}" khỏi danh sách yêu thích`);
    } else {
      message.success(`Đã thêm "${product.title}" vào danh sách yêu thích`);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalVisible(true); // Mở modal khi click
  };

  const discountPercentage = product.discount && product.price > 0
    ? Math.round((product.discount / product.price) * 100)
    : 0;

  return (
    <>
      <Card
        hoverable
        className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        bodyStyle={{ padding: '8px' }}
        headStyle={{ padding: '0' }}
      >
        <div className="p-0 relative overflow-hidden group">
          {product.discount && product.discount > 0 ? (
            <div
              className="absolute top-2 left-2 z-10 text-xs font-bold py-1 px-2 rounded-sm leading-none
                         bg-red-500 text-white"
            >
              -{discountPercentage}%
            </div>
          ) : null}
          <div className="relative w-full aspect-square overflow-hidden rounded-md transition-transform duration-300 group-hover:scale-105">
            <Image
              src={product.thumb}
              alt={product.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
            <Tooltip title="Xem nhanh"> {/* Đổi tooltip */}
              <div
                className="rounded-full bg-white/80 border p-2 cursor-pointer hover:bg-white text-gray-700 hover:text-blue-500 transition-colors duration-200 flex items-center justify-center"
                onClick={handleQuickViewClick} // Gán sự kiện click
              >
                <Eye className="w-4 h-4" />
              </div>
            </Tooltip>
            <Tooltip title={isProductInWishlist ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}>
              <div
                className={`rounded-full bg-white/80 border p-2 cursor-pointer transition-colors duration-200 flex items-center justify-center ${
                  isProductInWishlist ? 'bg-white text-red-500' : 'hover:bg-white text-gray-700 hover:text-red-500'
                }`}
                onClick={handleToggleWishlist}
              >
                <Heart className="w-4 h-4" fill={isProductInWishlist ? 'currentColor' : 'none'} />
              </div>
            </Tooltip>
          </div>
        </div>

        <Link href={`/san-pham/${product.slug}`}>
          <h5 className="font-medium text-base md:text-lg mb-1 mt-2 cursor-pointer hover:underline">
            {product.title}
          </h5>
        </Link>
        {product.discount && product.discount > 0 ? (
          <div className="flex items-center space-x-2">
            <p className="text-red-500 text-lg">
              {formatVND(product.price - product.discount)}
            </p>
            <p className="text-gray-500 line-through text-sm">
              {formatVND(product.price)}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-lg">
            {formatVND(product.price)}
          </p>
        )}
        {product.averageRating !== null && product.averageRating !== undefined && (
          <div className="flex items-center mt-1">
            {[...Array(Math.round(product.averageRating))].map((_, index) => (
              <Star key={index} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            ))}
            {[...Array(5 - Math.round(product.averageRating))].map((_, index) => (
              <Star key={`empty-${index}`} className="w-4 h-4 text-gray-300" />
            ))}
            {product.ratingCount !== undefined && product.ratingCount > 0 && (
              <span className="text-gray-500 text-sm ml-1">({product.ratingCount})</span>
            )}
          </div>
        )}
      </Card>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        productId={product.id} // Truyền productId để fetch dữ liệu chi tiết
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
};