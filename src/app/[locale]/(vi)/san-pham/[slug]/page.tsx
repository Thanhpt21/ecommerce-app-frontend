// app/[locale]/san-pham/[slug]/page.tsx
'use client';

import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { useProductBySlug } from '@/hooks/product/useProductBySlug';
import { useVariants } from '@/hooks/variant/useVariants';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Import các component từ Ant Design
import { Card, Button, Typography, Tag, Space, Breadcrumb, Tabs, message } from 'antd'; // Thêm message từ Ant Design
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { StarHalf } from 'lucide-react';
import Link from 'next/link';
import { useLocaleContext } from '@/context/LocaleContext';
import RatingComponent from '@/components/layout/rating/RatingComponent';
import { useCart } from '@/stores/cartStore';
import { color } from 'framer-motion';
import ProductImageGallery from '@/components/layout/product/ProductImageGallery';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { t } = useTranslation('product_detail');
  const { locale } = useLocaleContext();
  const { slug } = useParams();
  const router = useRouter();
  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useProductBySlug({ slug: slug as string });
  const product = productData;
  const productId = product?.id; // productId ở đây là ID của sản phẩm chính

  const { data: variantsResponse, isLoading: isVariantsLoading, isError: isVariantsError } = useVariants({ productId: productId });
  const variants = variantsResponse?.data;

  // currentData sẽ chứa dữ liệu của sản phẩm (nếu đang xem sản phẩm gốc) hoặc biến thể (nếu đang xem biến thể)
  // Đảm bảo currentData có đủ thông tin cần thiết, bao gồm cả productId gốc
  const [currentData, setCurrentData] = useState<any>(null);
  const [isViewingProduct, setIsViewingProduct] = useState(true);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const { addItem: addItemToCart } = useCart();

  // Khởi tạo currentData khi productData có sẵn
  useEffect(() => {
    if (productData && !currentData) {
      setCurrentData({
        ...productData,
        // Gán productId gốc cho cả productData và variantData để dễ dàng truy cập
        // Khi productData là chính nó, productData.id sẽ là productId gốc.
        // Khi currentData là một variant, variant.productId sẽ là ID của sản phẩm gốc.
        // Điều này đảm bảo field 'productId' luôn có mặt và đúng kiểu
        productId: productData.id,
      });
      setIsViewingProduct(true);
    }
  }, [productData, currentData]);

  // Thiết lập kích thước mặc định và ảnh chính khi currentData thay đổi
  useEffect(() => {
    if (currentData) {
      if (currentData.sizes && currentData.sizes.length > 0) {
        const defaultSize = currentData.sizes[0];
        setSelectedSizeId(defaultSize?.id || null);
      } else {
        setSelectedSizeId(null);
      }
      setMainImage(currentData.thumb);
    }
  }, [currentData]);

  const handleViewVariantByColor = (variant: any) => {
    // Khi chọn variant, chúng ta gán variant.productId vào currentData.productId
    // để nó luôn trỏ về ID của sản phẩm cha.
    setCurrentData({
      ...variant,
      productId: variant.productId, // Variant đã có productId gốc
       variantId: variant.id,
    });
    setIsViewingProduct(false);
  };

  const resetToProduct = () => {
    setCurrentData({
      ...product,
      productId: product?.id, // Đảm bảo productId của sản phẩm gốc là ID của nó
      variantId: undefined,
    });
    setIsViewingProduct(true);
  };

  const handleSelectSize = (sizeId: string) => {
    setSelectedSizeId(sizeId);
  };

  const handleThumbnailClick = (imgUrl: string) => {
    setMainImage(imgUrl);
  };

  // Hàm trợ giúp để chuẩn bị dữ liệu sản phẩm cho giỏ hàng/thanh toán
  const prepareItemForCart = () => {
    if (!currentData) {
      message.error(t('product_data_not_loaded'));
      return null;
    }

    if (currentData.sizes && currentData.sizes.length > 0 && !selectedSizeId) {
      message.error(t('please_select_size'));
      return null;
    }

    const selectedSize = currentData?.sizes?.find((s: { id: string; title: string }) => s.id === selectedSizeId);

    const itemProductId = Number(currentData.productId);

    const numericalSizeId = selectedSize?.id ? Number(selectedSize.id) : undefined;
    const numericalColorId = currentData.color?.id ? Number(currentData.color.id) : undefined;

    return {
      productId: itemProductId,
      variantId: currentData.variantId,
      thumb: currentData.thumb,
      title: currentData.title,
      price: currentData.price,
      discount: currentData.discount,
      color: currentData.color ? {
        id: currentData.color.id,
        title: currentData.color.title,
        code: currentData.color.code,
      } : undefined,
      colorId: numericalColorId,
      sizeId: numericalSizeId,
      size: selectedSize ? { id: selectedSize.id, title: selectedSize.title } : undefined,
    };
  };


 const handleAddToCart = () => {
    const itemToAdd = prepareItemForCart();
    if (itemToAdd) {
      addItemToCart(itemToAdd);
      message.success(`${t('added_to_cart')}`);
    }
  };

  const handleBuyNow = () => {
    const itemToBuy = prepareItemForCart();
    if (itemToBuy) {
      addItemToCart(itemToBuy); // Thêm vào giỏ hàng
      message.success(`${t('buying_now')}`);
      // Chuyển hướng đến trang thanh toán
      router.push(`/${locale}/thanh-toan`); // <-- THÊM DÒNG NÀY ĐỂ CHUYỂN HƯỚNG
    }
  };

  const renderStars = (averageRating: number, ratingCount: number) => {
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

     return (
    <div className="flex items-center space-x-1 text-yellow-500">
      {/* Bao bọc tất cả các biểu tượng sao và span trong một Fragment */}
      <>
        {[...Array(fullStars)].map((_, i) => (
          <StarFilled key={`full-${i}`} />
        ))}
        {/* Đảm bảo StarHalf được import và là một component React hợp lệ */}
        {hasHalfStar && <StarHalf key="half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <StarOutlined key={`empty-${i}`} className="text-gray-400" />
        ))}
        {ratingCount > 0 ? (
          <span className="ml-2 text-sm text-gray-600">({ratingCount} {t('ratings')})</span>
        ) : (
          <span className="ml-2 text-sm text-gray-600">({t('no_ratings_yet')})</span>
        )}
      </>
    </div>
  );
  };

  if (isProductLoading || isVariantsLoading || !currentData || !mainImage) {
    return <div className="text-center py-5">{t('loading')}...</div>;
  }

  if (isProductError || isVariantsError || !product) {
    return <div className="text-center py-5 text-red-500">{t('error_loading_product')}</div>;
  }

  const displayAverageRating = currentData?.averageRating !== undefined ? currentData.averageRating : product.averageRating;
  const displayRatingCount = currentData?.ratingCount !== undefined ? currentData.ratingCount : product.ratingCount;

  const allCurrentImages = currentData?.images ? [currentData.thumb, ...currentData.images].filter(Boolean) : [];
  const uniqueCurrentImages = Array.from(new Set(allCurrentImages));

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <div className='mb-4'>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href={`/${locale}`}>{t('home')}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/${locale}/san-pham`}>{t('products')}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{product.title}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductImageGallery
          currentData={currentData}
          productTitle={product.title}
          mainImage={mainImage}
          onThumbnailClick={handleThumbnailClick}
        />

        <div>
          <Title level={2} className="mb-2">{currentData?.title || product.title}</Title>
          <Text type="secondary" className="mb-4 block">
            {(currentData?.brand?.title || product?.brand?.title)} - {(currentData?.category?.title || product?.category?.title)}
          </Text>

          <div className="mb-2">
            {renderStars(displayAverageRating, displayRatingCount)}
          </div>

          {(currentData?.discount || product?.discount) > 0 ? (
            <Space size="small" className="mb-2 items-center">
              <Title level={4} type="danger" className="m-0 text-red-500 font-semibold text-lg">
                {t('price')}: {((currentData?.price || product?.price) - (currentData?.discount || product?.discount))?.toLocaleString()} VNĐ
              </Title>
              <Text delete type="secondary" className="text-gray-500">{(currentData?.price || product?.price)?.toLocaleString()} VNĐ</Text>
            </Space>
          ) : (
            <Title level={4} className="mb-2 text-gray-600 text-lg">{t('price')}: {(currentData?.price || product?.price)?.toLocaleString()} VNĐ</Title>
          )}

          <div className="mb-4">
            <Title level={5} className="font-semibold mb-2">{t('color')}:</Title>
            <Space wrap size={[0, 8]} className="flex items-center overflow-x-auto pb-2">
              {/* Product Color Card */}
              {product?.thumb && product?.color && (
                <Card
                  onClick={resetToProduct}
                  hoverable
                  className={`w-[70px] h-[70px] p-0.5 rounded-md cursor-pointer ${isViewingProduct ? 'border-blue-500 border-2' : 'border border-gray-300 hover:border-gray-400'}`}
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden">
                    <Image
                      src={product.thumb}
                      alt={product.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full mt-1 border ${isViewingProduct ? 'border-blue-500 border-2' : 'border-gray-300'}`}
                    style={{ backgroundColor: product.color.code }}
                    title={product.color.title}
                  ></div>
                </Card>
              )}

              {/* Variants Color Cards */}
              {variants && variants
                .filter(variant => variant.thumb && variant.color)
                .map(variant => (
                  <Card
                    onClick={() => handleViewVariantByColor(variant)}
                    key={variant.id}
                    hoverable
                    className={`w-[70px] h-[70px] p-0.5 rounded-md cursor-pointer ${!isViewingProduct && currentData?.id === variant.id ? 'border-blue-500 border-2' : 'border border-gray-300 hover:border-gray-400'}`}
                    bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                      <Image
                        src={variant.thumb}
                        alt={variant.title || ''}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full mt-1 border ${!isViewingProduct && currentData?.id === variant.id ? 'border-blue-500 border-2' : 'border-gray-300'}`}
                      style={{ backgroundColor: variant.color?.code }}
                      title={variant.color?.title}
                    ></div>
                  </Card>
                ))}
            </Space>
          </div>

          <div className="mb-6">
            <Title level={5} className="font-semibold mb-2">{t('sizes')}:</Title>
            <div className="flex flex-wrap gap-2">
              {(currentData?.sizes || []).map((item: any) => {
                const sizeId = item.id;
                const sizeTitle = item.title;
                return (
                  <div
                    key={sizeId}
                    onClick={() => handleSelectSize(sizeId)}
                    className={`cursor-pointer px-3 py-1 text-sm rounded-md border ${selectedSizeId === sizeId ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  >
                    {sizeTitle}
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="primary" size="large" className="w-fit" onClick={handleAddToCart}>
            {t('add_to_cart')}
          </Button>
          <Button
              type="default" // Or 'primary' if you want it to stand out
              size="large"
              onClick={handleBuyNow}
              className="px-6 py-3"
            >
              {t('buy_now')} {/* Assuming you have a 'buy_now' translation key */}
            </Button>
           
        </div>
      </div>
      <div className="mt-10">
        {productId && (
          <Tabs defaultActiveKey="description" size="large">
            <Tabs.TabPane tab={t('description_tab')} key="description">
              <div className="py-4">
                <div dangerouslySetInnerHTML={{ __html: product?.description || t('no_description_available') }} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('reviews_tab')} key="reviews">
              <RatingComponent productId={productId} t={t} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('policy_tab')} key="policy">
              <div className="py-4">
                <Title level={4} className="mb-4">{t('shipping_policy')}</Title>
                <Paragraph>{t('shipping_policy_content')}</Paragraph>

                <Title level={4} className="mt-6 mb-4">{t('return_policy')}</Title>
                <Paragraph>{t('return_policy_content')}</Paragraph>

                <Title level={4} className="mt-6 mb-4">{t('warranty_policy')}</Title>
                <Paragraph>{t('warranty_policy_content')}</Paragraph>
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </div>
    </div>
  );
}