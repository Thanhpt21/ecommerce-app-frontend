// components/product/ProductImageGallery.tsx
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Card, Carousel, Button } from 'antd'; // Import Carousel and Button
import { UpOutlined, DownOutlined } from '@ant-design/icons'; // Import arrow icons
import { useTranslation } from 'react-i18next';

interface ProductImageGalleryProps {
  currentData: any; // Can be product or variant data
  productTitle: string; // Original product title for alt text fallback
  mainImage: string | null;
  onThumbnailClick: (imageUrl: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  currentData,
  productTitle,
  mainImage,
  onThumbnailClick,
}) => {
  const { t } = useTranslation();
  const carouselRef = useRef<any>(null); // Create a ref for the Carousel

  const allCurrentImages = currentData?.images
    ? [currentData.thumb, ...currentData.images].filter(Boolean)
    : [];
  const uniqueCurrentImages = Array.from(new Set(allCurrentImages));

  // Handler for next/previous buttons
  const next = () => {
    carouselRef.current?.next();
  };

  const prev = () => {
    carouselRef.current?.prev();
  };

  // Check if we need navigation arrows (more than 4 images)
  const showNavigation = uniqueCurrentImages.length > 4;

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Thumbnail column with vertical slider */}
      <div className="col-span-1 flex flex-col items-center justify-center gap-2">
        {showNavigation && (
          <Button
            type="text"
            icon={<UpOutlined />}
            onClick={prev}
            className="w-full !min-w-0 !p-0" // Adjust button padding if necessary
          />
        )}
        <div className="flex-grow w-full">
          <Carousel
            ref={carouselRef}
            dots={false} // Hide default dots
            vertical // Enable vertical mode
            slidesToShow={4} // Show 4 images at a time
            slidesToScroll={1} // Scroll one image at a time
            infinite={false} // Do not loop endlessly
            className="h-full" // Ensure carousel takes full height to fill container
          >
            {uniqueCurrentImages.map((img: string, index: number) => (
              <div key={img} className="px-1 py-1"> {/* Add padding for spacing between cards */}
                <Card
                  bodyStyle={{ padding: 0 }}
                  className={`relative w-full aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-80 border ${mainImage === img ? 'border-blue-500 border-2' : 'border-gray-300'}`}
                  hoverable
                  onClick={() => onThumbnailClick(img)}
                >
                  <Image
                    src={img}
                    alt={`${currentData?.title || productTitle} - ${t('image')} ${index + 1}`}
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
            className="w-full !min-w-0 !p-0" // Adjust button padding if necessary
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