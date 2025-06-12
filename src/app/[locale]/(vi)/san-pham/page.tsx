'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Product } from '@/types/product.type';
import { useProducts } from '@/hooks/product/useProducts';
import { useLocaleContext } from '@/context/LocaleContext';
import { useCategories } from '@/hooks/category/useCategories';
import { useColors } from '@/hooks/color/useColors';
import { useBrands } from '@/hooks/brand/useBrands';
import { Breadcrumb, Button, Select, Spin, Input, Tooltip, Pagination } from 'antd';
import { formatVND } from '@/utils/helpers';
import { useEffect, useState, useCallback, useMemo } from 'react'; // Added useMemo
import { Color } from '@/types/color.type';
import { Brand } from '@/types/brand.type';
import { Category } from '@/types/category.type';
import { ProductCard } from '@/components/layout/product/ProductCard';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'; // Import icons

export default function ProductsPage() {
  const { t } = useTranslation('products');
  const { locale } = useLocaleContext();

  // --- States cho lọc và sắp xếp ---
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [tempMinPrice, setTempMinPrice] = useState<string>(''); // Dùng cho input text
  const [tempMaxPrice, setTempMaxPrice] = useState<string>(''); // Dùng cho input text
  const [sortBy, setSortBy] = useState<string | undefined>('createdAt_desc'); // Mặc định sắp xếp mới nhất

  // --- States cho Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12; // Số sản phẩm hiển thị mỗi trang

  // --- States cho khả năng hiển thị các phần lọc (accordion) ---
  const [showCategoriesFilter, setShowCategoriesFilter] = useState(false); // Mặc định mở
  const [showBrandsFilter, setShowBrandsFilter] = useState(false); // Mặc định mở
  const [showColorsFilter, setShowColorsFilter] = useState(false); // Mặc định mở
  const [showPriceRangeFilter, setShowPriceRangeFilter] = useState(true); // Mặc định mở

  // Kiểm tra xem có bộ lọc nào đang được áp dụng không (trừ phân trang và sắp xếp)
  const areFiltersActive = useMemo(() => {
    return (
      selectedCategoryId !== null ||
      selectedBrandId !== null ||
      selectedColorId !== null ||
      minPrice !== undefined ||
      maxPrice !== undefined
    );
  }, [selectedCategoryId, selectedBrandId, selectedColorId, minPrice, maxPrice]);

  // --- Lấy dữ liệu sản phẩm ---
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

  // --- Lấy dữ liệu cho các bộ lọc (categories, colors, brands) ---
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

  // --- Event Handlers cho bộ lọc ---
  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi lọc
  };

  const handleColorClick = (colorId: number | null) => {
    setSelectedColorId(colorId === selectedColorId ? null : colorId);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi lọc
  };

  const handleBrandClick = (brandId: number | null) => {
    setSelectedBrandId(brandId === selectedBrandId ? null : brandId);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi lọc
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempMinPrice(value);
    const parsedValue = value ? parseInt(value, 10) : undefined;
    setMinPrice(parsedValue);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi lọc
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempMaxPrice(value);
    const parsedValue = value ? parseInt(value, 10) : undefined;
    setMaxPrice(parsedValue);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi lọc
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
    setCurrentPage(1); // Reset về trang 1 khi xóa lọc
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi sắp xếp
  };

  // --- Event Handler cho Phân trang ---
  const handlePageChange = (page: number) => { // Removed pageSize as it's fixed
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  type SortOption = {
    value: string;
    label: string;
  };

  const sortOptions: SortOption[] = [
    { value: 'createdAt_desc', label: t('newest') },
    { value: 'createdAt_asc', label: t('oldest') },
    { value: 'price_asc', label: t('price_low_to_high') },
    { value: 'price_desc', label: t('price_high_to_low') },
    { value: 'averageRating_desc', label: t('highest_rated') },
  ];

  // Hiển thị loading toàn màn hình khi tải trang đầu tiên
  if (isProductsLoading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Xử lý lỗi
  if (isProductsError) {
    return <div className="text-center py-10 text-red-500">{t('error_loading_products')}</div>;
  }

  return (
    <div className="container p-4 md:p-8 lg:p-12 mx-auto"> {/* Adjusted padding for consistency */}
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href={`/${locale}`}>
              {t('home')}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{t('all_products_title')}</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-10 gap-8'>
        {/* Sidebar lọc */}
        <aside className="lg:col-span-2 overflow-y-auto lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-24 pb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xl">{t('filters')}</span>
            <Button size="small" onClick={resetFilters}>{t('reset')}</Button>
          </div>

          {/* Categories filter */}
          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowCategoriesFilter(!showCategoriesFilter)}
            >
              <span className="font-semibold mb-0">{t('categories')}</span>
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
                          {t('view_more')}
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>

          {/* Brands filter */}
          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowBrandsFilter(!showBrandsFilter)}
            >
              <span className="font-semibold mb-0">{t('brands')}</span>
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
                          {t('view_more')}
                        </Button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            )}
          </div>

          {/* Colors filter */}
          <div className="border-b border-gray-200">
            <div
              className="flex justify-between items-center cursor-pointer py-2"
              onClick={() => setShowColorsFilter(!showColorsFilter)}
            >
              <span className="font-semibold mb-0">{t('colors')}</span>
              {showColorsFilter ? <MinusOutlined /> : <PlusOutlined />}
            </div>
            {showColorsFilter && (
              <div className="flex flex-wrap gap-2 mt-2 ml-1">
                {isColorsLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <Tooltip title={t('all_colors')}>
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
                        {t('view_more')}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Phần hiển thị sản phẩm */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {t('showing_products_total', {
                count: products.length, // Số sản phẩm trên trang hiện tại
                total: totalProducts,
              })}
            </h3>
            <Select
              value={sortBy}
              style={{ width: 200 }}
              onChange={handleSortChange}
              options={sortOptions}
              placeholder={t('sort_by')}
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
                    {t('no_products_found_with_filters')}
                  </p>
                  <Button onClick={resetFilters} type="primary" size="large">
                    {t('reset_filters')}
                  </Button>
                </>
              ) : (
                <p className="text-gray-600 text-lg">
                  {t('no_products_found')}
                </p>
              )}
            </div>
          )}


          {/* Phân trang Ant Design */}
          {totalProducts > 0 && products.length > 0 && ( // Chỉ hiển thị phân trang nếu có sản phẩm và sản phẩm đang hiển thị
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