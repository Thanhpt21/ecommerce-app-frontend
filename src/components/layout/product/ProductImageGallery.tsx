'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Card, Carousel, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

interface ProductImageGalleryProps {
  currentData: any;
  productTitle: string;
  mainImage: string | null;
  onThumbnailClick: (imageUrl: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  currentData,
  productTitle,
  mainImage,
  onThumbnailClick,
}) => {
  const carouselRef = useRef<any>(null);

  const allCurrentImages = currentData?.images
    ? [currentData.thumb, ...currentData.images].filter(Boolean)
    : [];
  const uniqueCurrentImages = Array.from(new Set(allCurrentImages));

  const next = () => {
    carouselRef.current?.next();
  };

  const prev = () => {
    carouselRef.current?.prev();
  };

  const showNavigation = uniqueCurrentImages.length > 4;

  return (
    <div className="grid grid-cols-5 gap-4 h-[500px]">
      {/* Thumbnail column with vertical slider */}
      <div className="col-span-1 flex flex-col items-center justify-center gap-2">
        {showNavigation && (
          <Button
            type="text"
            icon={<UpOutlined />}
            onClick={prev}
            className="w-full !min-w-0 !p-0"
          />
        )}
        <div className="flex-grow w-full">
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
                  onClick={() => onThumbnailClick(img)}
                >
                  <Image
                    src={img}
                    alt={`${currentData?.title || productTitle} - Hình ảnh ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
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
            onClick={next}
            className="w-full !min-w-0 !p-0"
          />
        )}
      </div>

      {/* Main Image Display */}
      <div className="col-span-4">
        <Card
          bodyStyle={{ padding: 0 }}
          className="w-full aspect-square overflow-hidden rounded-md border"
        >
          <Image
            src={mainImage || ''}
            alt={currentData?.title || productTitle}
            fill
            style={{ objectFit: 'contain' }}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 66vw"
          />
        </Card>
      </div>
    </div>
  );
};

export default ProductImageGallery;