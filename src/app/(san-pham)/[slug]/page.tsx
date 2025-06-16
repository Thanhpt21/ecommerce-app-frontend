// app/san-pham/[slug]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Spin, Pagination, Breadcrumb, Button, Select, Input, Tooltip } from 'antd';
import { LoadingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

// Ensure you have imported Product, Category, Color, Brand interfaces from your types file
import { Product } from '@/types/product.type';
import { Category } from '@/types/category.type';
import { Color } from '@/types/color.type';
import { Brand } from '@/types/brand.type';

import { useProductsByCategorySlug } from '@/hooks/product/useProductsByCategorySlug';
import { useCategories } from '@/hooks/category/useCategories';
import { useColors } from '@/hooks/color/useColors';
import { useBrands } from '@/hooks/brand/useBrands';

import { ProductCard } from '@/components/layout/product/ProductCard';
import { formatVND } from '@/utils/helpers';

export default function ProductCategoryPage() {
  const params = useParams();

  const categorySlug = params.slug as string;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [showBrandsFilter, setShowBrandsFilter] = useState(false);
  const [showColorsFilter, setShowColorsFilter] = useState(false);

  const areFiltersActive = useMemo(() => {
    return selectedBrandId !== null || selectedColorId !== null;
  }, [selectedBrandId, selectedColorId]);

  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
  } = useProductsByCategorySlug({
    categorySlug,
    page,
    limit,
    search,
    sortBy,
    brandId: selectedBrandId ?? undefined,
    colorId: selectedColorId ?? undefined,
  });

  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories({ limit: 100 });
  const allCategories = (categoriesResponse?.data as Category[]) || [];
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [categoriesToShow, setCategoriesToShow] = useState(10);

  useEffect(() => {
    setVisibleCategories(allCategories.slice(0, categoriesToShow));
  }, [allCategories, categoriesToShow]);

  const handleLoadMoreCategories = () => {
    setCategoriesToShow((prev) => prev + 10);
  };

  const { data: brandsResponse, isLoading: isBrandsLoading } = useBrands({ limit: 100 });
  const allBrands = (brandsResponse?.data as Brand[]) || [];
  const [visibleBrands, setVisibleBrands] = useState<Brand[]>([]);
  const [brandsToShow, setBrandsToShow] = useState(10);

  useEffect(() => {
    setVisibleBrands(allBrands.slice(0, brandsToShow));
  }, [allBrands, brandsToShow]);

  const handleLoadMoreBrands = () => {
    setBrandsToShow((prev) => prev + 10);
  };

  const { data: colorsResponse, isLoading: isColorsLoading } = useColors({ limit: 100 });
  const allLoadedColors = colorsResponse?.data || [];
  const [visibleColors, setVisibleColors] = useState<Color[]>([]);
  const [colorsToShow, setColorsToShow] = useState(20);

  useEffect(() => {
    setVisibleColors(allLoadedColors.slice(0, colorsToShow));
  }, [allLoadedColors, colorsToShow]);

  const handleLoadMoreColors = () => {
    setColorsToShow((prev) => prev + 10);
  };

  const categoryDisplayName = useMemo(() => {
    if (productsResponse?.categoryInfo) {
      return productsResponse.categoryInfo.title;
    }
    return 'Danh mục sản phẩm';
  }, [productsResponse]);

  const handleColorClick = (colorId: number | null) => {
    setSelectedColorId(colorId === selectedColorId ? null : colorId);
    setPage(1);
  };

  const handleBrandClick = (brandId: number | null) => {
    setSelectedBrandId(brandId === selectedBrandId ? null : brandId);
    setPage(1);
  };

  const resetFilters = useCallback(() => {
    setSelectedBrandId(null);
    setSelectedColorId(null);
    setSortBy('createdAt_desc');
    setPage(1);
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <p className="ml-3 text-lg">Đang tải...</p>
      </div>
    );
  }

  if (isError || (productsResponse && productsResponse.categoryInfo === null)) {
    console.error("Products fetch error or category not found:", error || "Category not found from API");
    if (productsResponse?.categoryInfo === null) {
      notFound();
    }
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-3xl font-bold mb-4">Lỗi khi tải sản phẩm</h1>
        <p>{error?.message || 'Đã xảy ra lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.'}</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const products = productsResponse?.data || [];
  const totalProducts = productsResponse?.total || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  type SortOption = {
    value: string;
    label: string;
  };

  const sortOptions: SortOption[] = [
    { value: 'createdAt_desc', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
    { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
    { value: 'sold_desc', label: 'Bán chạy nhất' },
    { value: 'averageRating_desc', label: 'Đánh giá cao nhất' },
  ];

  return (
    <div className="container p-4 md:p-8 lg:p-12 mx-auto">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">
              Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/san-pham">
              Tất cả sản phẩm
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {categoryDisplayName}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-10 gap-8'>
        <aside className="lg:col-span-2 overflow-y-auto lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-24 pb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xl">Bộ lọc</span>
            {areFiltersActive && (
              <Button size="small" onClick={resetFilters}>Đặt lại</Button>
            )}
          </div>

          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowBrandsFilter(!showBrandsFilter)}
            >
              <span className="font-semibold mb-0">Thương hiệu</span>
              {showBrandsFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showBrandsFilter && (
              <ul className="mt-2">
                {isBrandsLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {visibleBrands.map((brand) => (
                      <li
                        key={brand.id}
                        className={`mb-2 cursor-pointer hover:underline ${selectedBrandId === brand.id ? 'font-bold text-blue-600' : ''}`}
                        onClick={() => handleBrandClick(brand.id)}
                      >
                        {brand.title}
                      </li>
                    ))}
                    {allBrands.length > visibleBrands.length && (
                      <li className="mb-2">
                        <Button size="small" onClick={handleLoadMoreBrands}>
                          Xem thêm
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>

          <div className="">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowColorsFilter(!showColorsFilter)}
            >
              <span className="font-semibold mb-0">Màu sắc</span>
              {showColorsFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showColorsFilter && (
              <div className="flex flex-wrap gap-2 mt-2 ml-1">
                {isColorsLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {visibleColors.map((color: Color) => (
                      <Tooltip key={color.id} title={color.title}>
                        <div
                          className={`w-8 h-8 rounded-full cursor-pointer mb-2 shadow ${selectedColorId === color.id ? 'ring-2 ring-blue-600' : ''}`}
                          style={{ backgroundColor: color.code }}
                          onClick={() => handleColorClick(color.id)}
                        ></div>
                      </Tooltip>
                    ))}
                    {allLoadedColors.length > visibleColors.length && (
                      <Button size="small" onClick={handleLoadMoreColors}>
                        Xem thêm
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Hiển thị {products.length} trên tổng số {totalProducts} sản phẩm
            </h3>
            <Select
              value={sortBy}
              style={{ width: 200 }}
              onChange={handleSortChange}
              options={sortOptions}
              placeholder="Sắp xếp theo"
            />
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              {areFiltersActive ? (
                <>
                  <p className="text-gray-600 text-lg mb-4">
                    Không tìm thấy sản phẩm nào với các bộ lọc đã chọn.
                  </p>
                  <Button onClick={resetFilters} type="primary" size="large">
                    Đặt lại bộ lọc
                  </Button>
                </>
              ) : (
                <p className="text-gray-600 text-lg">
                  Không có sản phẩm nào trong danh mục này.
                </p>
              )}
            </div>
          )}

          {totalProducts > limit && products.length > 0 && (
            <div className="flex justify-center mt-12">
              <Pagination
                current={page}
                pageSize={limit}
                total={totalProducts}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}