'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProductBySlug } from '@/hooks/product/useProductBySlug';
import { useVariants } from '@/hooks/variant/useVariants';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Card, Button, Typography, Tag, Space, Breadcrumb, Tabs, message, Tooltip, Badge } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { StarHalf } from 'lucide-react';
import Link from 'next/link';
import RatingComponent from '@/components/layout/rating/RatingComponent';
import { useCart } from '@/stores/cartStore';
import ProductImageGallery from '@/components/layout/product/ProductImageGallery';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useProductBySlug({ slug: slug as string });
  const productId = productData?.id;

  // Lấy variants và xử lý để nhúng weight/weightUnit từ productData
  const { data: variantsResponse, isLoading: isVariantsLoading, isError: isVariantsError } = useVariants({ productId: productId });

  // ⭐ Bắt đầu phần chỉnh sửa để nhúng weight/weightUnit ⭐
  const product = productData ? {
    ...productData,
    // Đảm bảo sản phẩm gốc có weight/weightUnit. Nếu API trả về rồi thì đây là cách "khẳng định" lại
    weight: productData.weight,
    weightUnit: productData.weightUnit,
  } : undefined;

  const variants = variantsResponse?.data?.map((variant: any) => ({
    ...variant,
    // Nhúng weight/weightUnit từ productData nếu variant không có thuộc tính này
    weight: variant.weight !== undefined ? variant.weight : productData?.weight,
    weightUnit: variant.weightUnit !== undefined ? variant.weightUnit : productData?.weightUnit,
  })) || [];
  // ⭐ Kết thúc phần chỉnh sửa ⭐


  const [currentData, setCurrentData] = useState<any>(null);
  const [isViewingProduct, setIsViewingProduct] = useState(true);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [sizeMessage, setSizeMessage] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);


  const { addItem: addItemToCart } = useCart();

  // useEffect để khởi tạo currentData khi product (đã được xử lý weight/weightUnit) có sẵn
  useEffect(() => {
    if (product && !currentData) {
      setCurrentData({
        ...product, // 'product' ở đây đã có weight và weightUnit
        productId: product.id,
      });
      setIsViewingProduct(true);
    }
  }, [product, currentData]);

  useEffect(() => {
    if (currentData) {
      if (currentData.sizes && currentData.sizes.length > 0) {
        const defaultSize = currentData.sizes[0];
        setSelectedSizeId(defaultSize?.id || null);
        if (defaultSize?.quantity !== undefined) {
          setSizeMessage(`Size ${defaultSize.title} còn ${defaultSize.quantity} sản phẩm.`);
        } else {
          setSizeMessage('');
        }
      } else {
        setSelectedSizeId(null);
        setSizeMessage('');
      }
      setMainImage(currentData.thumb);
    }
  }, [currentData]);

  const handleViewVariantByColor = (variant: any) => {
    // 'variant' ở đây đã là đối tượng đã được xử lý từ mảng 'variants' phía trên,
    // nên nó đã có sẵn weight và weightUnit chính xác.
    setCurrentData({
      ...variant,
      productId: variant.productId,
      variantId: variant.id,
    });
    setIsViewingProduct(false);
    setSelectedSizeId(null);
    setSizeMessage('');
  };

  const resetToProduct = () => {
    // 'product' ở đây cũng là đối tượng đã được xử lý ở trên
    setCurrentData({
      ...product,
      productId: product?.id,
      variantId: undefined,
    });
    setIsViewingProduct(true);
    setSelectedSizeId(null);
    setSizeMessage('');
  };

  const handleSelectSize = (sizeId: number, quantity: number, sizeTitle: string) => {
    setSelectedSizeId(sizeId);
    setSizeMessage(`Size ${sizeTitle} còn ${quantity} sản phẩm.`);
  };

  const handleThumbnailClick = (imgUrl: string) => {
    setMainImage(imgUrl);
  };

  const prepareItemForCart = () => {
    if (!currentData) {
      message.error('Dữ liệu sản phẩm chưa được tải.');
      return null;
    }

    if (currentData.sizes && currentData.sizes.length > 0 && !selectedSizeId) {
      message.error('Vui lòng chọn kích thước!');
      return null;
    }

    const selectedSize = currentData?.sizes?.find((s: { id: number; title: string; quantity: number }) => s.id === selectedSizeId);

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
      weight: currentData.weight,       // ⭐ Giờ đây weight luôn chính xác vì đã được nhúng ⭐
      weightUnit: currentData.weightUnit, // ⭐ và weightUnit cũng vậy ⭐
    };
  };

  const handleAddToCart = () => {
    const itemToAdd = prepareItemForCart();
    if (itemToAdd) {
      addItemToCart(itemToAdd);
      message.success('Đã thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    const itemToBuy = prepareItemForCart();
    if (itemToBuy) {
      addItemToCart(itemToBuy);
      message.success('Đang chuyển hướng đến trang thanh toán...');
      router.push('/thanh-toan');
    }
  };

  const renderStars = (averageRating: number, ratingCount: number) => {
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);


    return (
      <div className="flex items-center space-x-1 text-yellow-500">
        <>
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
        </>
      </div>
    );
  };

  if (isProductLoading || isVariantsLoading || !currentData || !mainImage) {
    return <div className="text-center py-5">Đang tải...</div>;
  }

  if (isProductError || isVariantsError || !product) {
    return <div className="text-center py-5 text-red-500">Lỗi khi tải sản phẩm.</div>;
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
            <Link href="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/san-pham">Sản phẩm</Link>
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
                Giá: {((currentData?.price || product?.price) - (currentData?.discount || product?.discount))?.toLocaleString()} VNĐ
              </Title>
              <Text delete type="secondary" className="text-gray-500">{(currentData?.price || product?.price)?.toLocaleString()} VNĐ</Text>
            </Space>
          ) : (
            <Title level={4} className="mb-2 text-gray-600 text-lg">Giá: {(currentData?.price || product?.price)?.toLocaleString()} VNĐ</Title>
          )}

          <div className="mb-4">
            <Title level={5} className="font-semibold mb-2">Màu sắc:</Title>
            <Space wrap size={[0, 8]} className="flex items-center overflow-x-auto pb-2">
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

              {variants
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
            <Title level={5} className="font-semibold mb-2">
              Kích thước:
            </Title>
            <div className="flex flex-wrap gap-2">
              {(currentData?.sizes || []).map((item: any) => {
                const sizeId = item.id;
                const sizeTitle = item.title;
                const quantity = item.quantity;

                return (
                  <div
                    key={sizeId}
                    onClick={() => handleSelectSize(sizeId, quantity, sizeTitle)}
                    className={`cursor-pointer px-3 py-1 text-sm rounded-md border ${
                      selectedSizeId === sizeId
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {sizeTitle}
                  </div>
                );
              })}
            </div>
            {sizeMessage && <p className="mt-2 text-sm text-gray-600">{sizeMessage}</p>}
          </div>

          <Button type="primary" size="large" className="w-fit" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </Button>
          <Button
            type="default"
            size="large"
            onClick={handleBuyNow}
            className="px-6 py-3"
          >
            Mua ngay
          </Button>
        </div>
      </div>
      <div className="mt-10">
        {productId && (
          <Tabs defaultActiveKey="description" size="large">
            <Tabs.TabPane tab="Mô tả" key="description">
              <div className="py-4">
                <div dangerouslySetInnerHTML={{ __html: product?.description || 'Không có mô tả nào được cung cấp.' }} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Đánh giá" key="reviews">
              <RatingComponent productId={productId} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Chính sách" key="policy">
              <div className="py-4">
                <Title level={4} className="mb-4">Chính sách vận chuyển</Title>
                <Paragraph>Chúng tôi cam kết giao hàng nhanh chóng và an toàn. Thời gian giao hàng dự kiến từ 2-5 ngày làm việc tùy thuộc vào địa điểm. Chúng tôi hợp tác với các đối tác vận chuyển uy tín để đảm bảo sản phẩm đến tay bạn trong tình trạng tốt nhất.</Paragraph>

                <Title level={4} className="mt-6 mb-4">Chính sách đổi trả</Title>
                <Paragraph>Chúng tôi hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng với mô tả. Vui lòng giữ lại hóa đơn và sản phẩm trong tình trạng ban đầu để được hỗ trợ tốt nhất.</Paragraph>

                <Title level={4} className="mt-6 mb-4">Chính sách bảo hành</Title>
                <Paragraph>Tất cả sản phẩm của chúng tôi đều được bảo hành chính hãng. Thời gian bảo hành cụ thể sẽ tùy thuộc vào từng loại sản phẩm. Vui lòng liên hệ bộ phận chăm sóc khách hàng để biết thêm chi tiết về chính sách bảo hành áp dụng cho sản phẩm của bạn.</Paragraph>
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </div>
    </div>
  );
}