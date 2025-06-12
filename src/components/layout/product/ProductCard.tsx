// src/components/products/ProductCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, Tag, Tooltip, message } from 'antd'; // Import `message` for notifications
import { Eye, Heart, Star } from 'lucide-react';
import { Product } from '@/types/product.type';
import { formatVND } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';
import { useLocaleContext } from '@/context/LocaleContext';
import { useWishlist } from '@/stores/useWishlistStore'; // Import useWishlist

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation('products');
  const { locale } = useLocaleContext();
  const { toggleItem, isInWishlist } = useWishlist(); // Lấy các hàm và state từ wishlist store

  // Kiểm tra xem sản phẩm có trong wishlist không
  const isProductInWishlist = isInWishlist(product.id);

  // Xử lý khi click vào icon trái tim
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn sự kiện click của thẻ Link cha
    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên Card cha

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

    toggleItem(wishlistItem); // Gọi hàm toggleItem để thêm/xóa

    // Hiển thị thông báo
    if (isProductInWishlist) {
      message.success(t('removed_from_wishlist', { productTitle: product.title }));
    } else {
      message.success(t('added_to_wishlist', { productTitle: product.title }));
    }
  };

  // Tính phần trăm giảm giá
  const discountPercentage = product.discount && product.price > 0
    ? Math.round((product.discount / product.price) * 100)
    : 0;

  return (
    <Card
      hoverable
      className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      bodyStyle={{ padding: '8px' }}
      headStyle={{ padding: '0' }}
    >
      <div className="p-0 relative overflow-hidden group">
        {product.discount && product.discount > 0 ? (
          <Tag
            color="red"
            className="absolute top-2 left-2 z-10 !text-xs !font-bold py-1 px-2 !rounded-sm !leading-none"
            style={{ padding: '0px 7px' }}
          >
            -{discountPercentage}%
          </Tag>
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
          <Tooltip title={t('view_detail')}>
            <Link href={`/${locale}/san-pham/${product.slug}`}>
              <div className="rounded-full bg-white/80 border p-2 cursor-pointer hover:bg-white text-gray-700 hover:text-blue-500 transition-colors duration-200 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </Link>
          </Tooltip>
          <Tooltip title={isProductInWishlist ? t('remove_from_wishlist') : t('add_to_wishlist')}>
            <div
              className={`rounded-full bg-white/80 border p-2 cursor-pointer transition-colors duration-200 flex items-center justify-center ${
                isProductInWishlist ? 'bg-white text-red-500' : 'hover:bg-white text-gray-700 hover:text-red-500'
              }`}
              onClick={handleToggleWishlist} // Gọi hàm xử lý wishlist
            >
              <Heart className="w-4 h-4" fill={isProductInWishlist ? 'currentColor' : 'none'} /> {/* Fill icon nếu đã trong wishlist */}
            </div>
          </Tooltip>
          {/* Thêm nút thêm vào giỏ hàng nếu cần */}
          {/* <Tooltip title={t('add_to_cart')}>
            <div className="rounded-full bg-white/80 border p-2 cursor-pointer hover:bg-white text-gray-700 hover:text-green-500 transition-colors duration-200 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </Tooltip> */}
        </div>
      </div>

      <Link href={`/${locale}/san-pham/${product.slug}`}>
        <h5 className="font-semibold text-base md:text-lg mb-1 mt-2 cursor-pointer hover:underline truncate">
          <Tooltip title={product.title}>
            {product.title}
          </Tooltip>
        </h5>
      </Link>
      {product.discount && product.discount > 0 ? (
        <div className="flex items-center space-x-2">
          <p className="text-red-500 font-bold text-lg">{formatVND(product.price - product.discount)}</p>
          <p className="text-gray-500 line-through text-sm">{formatVND(product.price)}</p>
        </div>
      ) : (
        <p className="text-gray-600 font-bold text-lg">{formatVND(product.price)}</p>
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
  );
};