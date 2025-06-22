'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Typography, Space, Button, Spin, Card, Carousel, Tooltip } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useVariants } from '@/hooks/variant/useVariants';
import { formatVND } from '@/utils/helpers';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { StarHalf } from 'lucide-react';
import { useProductOne } from '@/hooks/product/useProductOne';

const { Title, Text, Paragraph } = Typography;

interface ProductQuickViewModalProps {
  productId: number;
  isVisible: boolean;
  onClose: () => void;
}

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ productId, isVisible, onClose }) => {
  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useProductOne(productId);
  const { data: variantsResponse, isLoading: isVariantsLoading, isError: isVariantsError } = useVariants({ productId: productId });

  const [mainImage, setMainImage] = useState<string | null>(null);
  const carouselRef = useRef<any>(null);

  const product = productData;
  const variants = variantsResponse?.data;

  useEffect(() => {
    if (product) {
      setMainImage(product.thumb);
      if (carouselRef.current) {
        carouselRef.current.goTo(0, false);
      }
    }
  }, [productId, product]);

  const handleThumbnailClick = (imageUrl: string) => {
    setMainImage(imageUrl);
  };

  const nextCarousel = () => {
    carouselRef.current?.next();
  };

  const prevCarousel = () => {
    carouselRef.current?.prev();
  };

  const renderStars = (averageRating: number, ratingCount: number) => {
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1 text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <StarFilled key={`full-${i}`} />
        ))}
        {hasHalfStar && <StarHalf key="half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarOutlined key={`empty-${i}`} className="text-gray-400" />
        ))}
        {ratingCount > 0 ? (
          <span className="ml-2 text-sm text-gray-600">({ratingCount} đánh giá)</span>
        ) : (
          <span className="ml-2 text-sm text-gray-600">(Chưa có đánh giá nào)</span>
        )}
      </div>
    );
  };

  // Define the footer content
  const modalFooter = (
    <div className="text-center">
      <Link href={`/san-pham/${product?.slug}`} passHref>
        <Button type="primary" size="large">
          Xem Chi Tiết Sản Phẩm
        </Button>
      </Link>
    </div>
  );

  if (isProductLoading || isVariantsLoading || !product) {
    return (
      <Modal
        title="Xem nhanh sản phẩm"
        visible={isVisible}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
      >
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (isProductError || isVariantsError) {
    return (
      <Modal
        title="Lỗi"
        visible={isVisible}
        onCancel={onClose}
        footer={null}
        width={500}
        centered
      >
        <p className="text-center py-5 text-red-500">Không thể tải thông tin sản phẩm.</p>
      </Modal>
    );
  }

  const allCurrentImages = product?.images
    ? [product.thumb, ...product.images].filter(Boolean)
    : [product?.thumb].filter(Boolean);
  const uniqueCurrentImages = Array.from(new Set(allCurrentImages));

  const showNavigation = uniqueCurrentImages.length > 4;

  const uniqueColors = new Set<string>();
  if (product?.color?.code) {
    uniqueColors.add(product.color.code);
  }
  variants?.forEach(variant => {
    if (variant?.color?.code && uniqueColors.size < 2) {
      uniqueColors.add(variant.color.code);
    }
  });
  const displayedColors = Array.from(uniqueColors);

  return (
    <Modal
      title="Xem nhanh sản phẩm"
      visible={isVisible}
      onCancel={onClose}
      footer={modalFooter}
      width={800}
      centered
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Phần Gallery hình ảnh sản phẩm */}
        {/* Đặt chiều cao cố định cho container grid này để các cột con có thể giãn ra */}
        {/* Điều chỉnh chiều cao cho phù hợp, tránh quá lớn gây khoảng trống */}
        <div className="grid grid-cols-5 gap-4 h-[400px] md:h-[350px]">
          {/* Cột Thumbnail (col-span-1) */}
          {/* Đổi justify-between thành space-y-2 để kiểm soát khoảng cách giữa các phần tử */}
          <div className="col-span-1 flex flex-col items-center space-y-2 h-full">
            {showNavigation && (
              <Button
                type="text"
                icon={<UpOutlined />}
                onClick={prevCarousel}
                className="w-full !min-w-0 !p-0"
              />
            )}
            <div className="flex-grow w-full overflow-hidden">
              <Carousel
                ref={carouselRef}
                dots={false}
                vertical
                slidesToShow={4}
                slidesToScroll={1}
                infinite={false}
                className="h-full"
              >
                {uniqueCurrentImages.map((img: string, index: number) => (
                  <div key={img} className="px-1 py-1">
                    <Card
                      bodyStyle={{ padding: 0 }}
                      className={`relative w-full aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 border ${mainImage === img ? 'border-blue-500 border-2' : 'border-gray-300'}`}
                      hoverable
                      onClick={() => handleThumbnailClick(img)}
                    >
                      <Image
                        src={img}
                        alt={`${product?.title} - Hình ảnh ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }} // Giữ cover cho thumbnail để lấp đầy
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Card>
                  </div>
                ))}
              </Carousel>
            </div>
            {showNavigation && (
              <Button
                type="text"
                icon={<DownOutlined />}
                onClick={nextCarousel}
                className="w-full !min-w-0 !p-0"
              />
            )}
          </div>

          {/* Main Image Display (col-span-4) */}
          <div className="col-span-4 flex items-center justify-center h-full">
            <Card
              bodyStyle={{ padding: 0 }}
              // Sử dụng aspect-square để Card luôn là hình vuông, giúp kiểm soát kích thước
              // Thay vì h-full, để chiều cao của Card tự điều chỉnh theo aspect-square
              className="w-full aspect-square overflow-hidden rounded-md border"
            >
              <Image
                src={mainImage || product?.thumb || ''}
                alt={product?.title}
                fill
                // Bạn có thể thử 'cover' ở đây nếu muốn ảnh lấp đầy hoàn toàn khung
                // hoặc giữ 'contain' và chấp nhận khoảng trắng nếu tỷ lệ khung hình khác nhau.
                // Nếu muốn lấp đầy hoàn toàn và cắt bớt ảnh: objectFit: 'cover'
                // Nếu muốn ảnh hiện đầy đủ và chấp nhận khoảng trắng: objectFit: 'contain'
                // Đối với khung ảnh chính, 'contain' thường là lựa chọn tốt hơn để không làm biến dạng sản phẩm.
                // Để giảm khoảng trắng, bạn cần đảm bảo tỷ lệ khung hình của ảnh tương đồng với khung.
                // Hoặc bạn có thể điều chỉnh chiều cao của grid container h-[400px] nhỏ hơn.
                style={{ objectFit: 'contain' }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 66vw"
              />
            </Card>
          </div>
        </div>

        {/* Phần thông tin sản phẩm */}
        <div>
          <Title level={3} className="mb-2 !text-2xl">{product?.title}</Title>
          <Text type="secondary" className="mb-4 block text-sm">
            {product?.brand?.title} - {product?.category?.title}
          </Text>

          <div className="mb-2">
            {renderStars(product?.averageRating || 0, product?.ratingCount || 0)}
          </div>

          {product?.discount > 0 ? (
            <Space size="small" className="mb-2 items-center">
              <Title level={5} type="danger" className="m-0 text-red-500 font-semibold text-xl">
                {formatVND(product.price - product.discount)}
              </Title>
              <Text delete type="secondary" className="text-gray-500 text-base">{formatVND(product.price)}</Text>
            </Space>
          ) : (
            <Title level={5} className="mb-2 text-gray-600 text-xl">{formatVND(product?.price)}</Title>
          )}

          <div className="mb-4 mt-4">
            <Title level={5} className="font-semibold mb-2 text-base">Màu sắc:</Title>
            <Space wrap size={[0, 8]} className="flex items-center">
              {displayedColors.map((codeColor) => (
                <Tooltip title={codeColor} key={codeColor}>
                  <div
                    className="w-6 h-6 rounded-full cursor-pointer border border-gray-300"
                    style={{ backgroundColor: codeColor }}
                  />
                </Tooltip>
              ))}
              {displayedColors.length < 2 && variants?.some(v => v?.color?.code && !displayedColors.includes(v.color.code)) && (
                <Tooltip title="Thêm màu sắc">
                  <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">
                    +{variants?.filter(v => v?.color?.code && !displayedColors.includes(v.color.code)).length}
                  </div>
                </Tooltip>
              )}
            </Space>
          </div>

          <div className="mb-6">
            <Title level={5} className="font-semibold mb-2 text-base">
              Kích thước:
            </Title>
            <div className="flex flex-wrap gap-2">
              {product?.sizes?.length > 0 ? (
                product.sizes.map((item: any) => (
                  <div
                    key={item.id}
                    className="px-3 py-1 text-sm rounded-md border bg-gray-100 text-gray-700 border-gray-300"
                  >
                    {item.title} ({item.quantity} có sẵn)
                  </div>
                ))
              ) : (
                <Text type="secondary">Không có kích thước nào.</Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductQuickViewModal;