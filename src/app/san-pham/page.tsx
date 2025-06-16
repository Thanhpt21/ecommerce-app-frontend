'use client';

import Link from 'next/link';
import { Product } from '@/types/product.type';
import { useProducts } from '@/hooks/product/useProducts';
import { useCategories } from '@/hooks/category/useCategories';
import { useColors } from '@/hooks/color/useColors';
import { useBrands } from '@/hooks/brand/useBrands';
import { Breadcrumb, Button, Select, Spin, Input, Tooltip, Pagination } from 'antd';
import { formatVND } from '@/utils/helpers';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Color } from '@/types/color.type';
import { Brand } from '@/types/brand.type';
import { Category } from '@/types/category.type';
import { ProductCard } from '@/components/layout/product/ProductCard';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

export default function ProductsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [tempMinPrice, setTempMinPrice] = useState<string>('');
  const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string | undefined>('createdAt_desc');

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [showCategoriesFilter, setShowCategoriesFilter] = useState(false);
  const [showBrandsFilter, setShowBrandsFilter] = useState(false);
  const [showColorsFilter, setShowColorsFilter] = useState(false);
  const [showPriceRangeFilter, setShowPriceRangeFilter] = useState(true);

  const areFiltersActive = useMemo(() => {
    return (
      selectedCategoryId !== null ||
      selectedBrandId !== null ||
      selectedColorId !== null ||
      minPrice !== undefined ||
      maxPrice !== undefined
    );
  }, [selectedCategoryId, selectedBrandId, selectedColorId, minPrice, maxPrice]);

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    categoryId: selectedCategoryId ?? undefined,
    brandId: selectedBrandId ?? undefined,
    colorId: selectedColorId ?? undefined,
    price_gte: minPrice,
    price_lte: maxPrice,
    sortBy: sortBy,
  });

  const products = productsResponse?.data as Product[] || [];
  const totalProducts = productsResponse?.total || 0;

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

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId);
    setCurrentPage(1);
  };

  const handleColorClick = (colorId: number | null) => {
    setSelectedColorId(colorId === selectedColorId ? null : colorId);
    setCurrentPage(1);
  };

  const handleBrandClick = (brandId: number | null) => {
    setSelectedBrandId(brandId === selectedBrandId ? null : brandId);
    setCurrentPage(1);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempMinPrice(value);
    const parsedValue = value ? parseInt(value, 10) : undefined;
    setMinPrice(parsedValue);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempMaxPrice(value);
    const parsedValue = value ? parseInt(value, 10) : undefined;
    setMaxPrice(parsedValue);
    setCurrentPage(1);
  };

  const resetFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setSelectedColorId(null);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setTempMinPrice('');
    setTempMaxPrice('');
    setSortBy('createdAt_desc');
    setCurrentPage(1);
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  type SortOption = {
    value: string;
    label: string;
  };

  const sortOptions: SortOption[] = [
    { value: 'createdAt_desc', label: 'Mới nhất' },
    { value: 'createdAt_asc', label: 'Cũ nhất' },
    { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
    { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
    { value: 'averageRating_desc', label: 'Đánh giá cao nhất' },
  ];

  if (isProductsLoading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isProductsError) {
    return <div className="text-center py-10 text-red-500">Lỗi khi tải sản phẩm.</div>;
  }

  return (
    <div className="container p-4 md:p-8 lg:p-12 mx-auto">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">
              Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Tất cả sản phẩm</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-10 gap-8'>
        <aside className="lg:col-span-2 overflow-y-auto lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-24 pb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xl">Bộ lọc</span>
            <Button size="small" onClick={resetFilters}>Đặt lại</Button>
          </div>

          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowCategoriesFilter(!showCategoriesFilter)}
            >
              <span className="font-semibold mb-0">Danh mục</span>
              {showCategoriesFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showCategoriesFilter && (
              <ul className="mt-2">
                {isCategoriesLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    {visibleCategories.map((category) => (
                      <li
                        key={category.id}
                        className={`mb-2 cursor-pointer hover:underline ${selectedCategoryId === category.id ? 'font-bold text-blue-600' : ''}`}
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        {category.title}
                      </li>
                    ))}
                    {allCategories.length > visibleCategories.length && (
                      <li className="mb-2">
                        <Button size="small" onClick={handleLoadMoreCategories}>
                          Xem thêm
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
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

          <div className="border-b border-gray-200">
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
                    <Tooltip title="Tất cả màu">
                      <div
                        className={`w-8 h-8 rounded-full cursor-pointer shadow ${selectedColorId === null ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-300'}`}
                        onClick={() => handleColorClick(null)}
                      ></div>
                    </Tooltip>
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

          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowPriceRangeFilter(!showPriceRangeFilter)}
            >
              <span className="font-semibold mb-0">Khoảng giá</span>
              {showPriceRangeFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showPriceRangeFilter && (
              <div className="flex flex-col gap-2 mt-2">
                <Input
                  placeholder="Giá tối thiểu"
                  type="number"
                  value={tempMinPrice}
                  onChange={handleMinPriceChange}
                  className="rounded-md"
                />
                <Input
                  placeholder="Giá tối đa"
                  type="number"
                  value={tempMaxPrice}
                  onChange={handleMaxPriceChange}
                  className="rounded-md"
                />
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
              {products.map((product: Product) => (
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
                  Không có sản phẩm nào được tìm thấy.
                </p>
              )}
            </div>
          )}

          {totalProducts > 0 && products.length > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={PRODUCTS_PER_PAGE}
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