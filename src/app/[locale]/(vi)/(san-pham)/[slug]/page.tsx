// app/(san-pham)/[slug]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Spin, Pagination, Breadcrumb, Button, Select, Input, Tooltip } from 'antd'; // Ant Design for Spin, Pagination, Breadcrumb, Button, Select, Input, Tooltip
import { LoadingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'; // Import PlusOutlined and MinusOutlined
import { useTranslation } from 'react-i18next';
import { useLocaleContext } from '@/context/LocaleContext';

// Ensure you have imported Product, Category, Color, Brand interfaces from your types file
import { Product } from '@/types/product.type';
import { Category } from '@/types/category.type';
import { Color } from '@/types/color.type';
import { Brand } from '@/types/brand.type';

import { useProductsByCategorySlug } from '@/hooks/product/useProductsByCategorySlug';
import { useCategories } from '@/hooks/category/useCategories'; // Import hook for categories
import { useColors } from '@/hooks/color/useColors'; // Import hook for colors
import { useBrands } from '@/hooks/brand/useBrands'; // Import hook for brands

import { ProductCard } from '@/components/layout/product/ProductCard';
import { formatVND } from '@/utils/helpers'; // Assuming this utility exists

export default function ProductCategoryPage() {
  const { t } = useTranslation('products'); // Using 'products' namespace for translation
  const { locale } = useLocaleContext();
  const params = useParams();

  const categorySlug = params.slug as string;

  // --- States for pagination and filters ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Number of products per page
  const [search, setSearch] = useState(''); // State for search input (if you re-enable it)
  const [sortBy, setSortBy] = useState('createdAt_desc'); // State for sorting

  // Filter states specific to this page (sub-filters within the category)
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  // --- States cho khả năng hiển thị các phần lọc (accordion) ---
  const [showBrandsFilter, setShowBrandsFilter] = useState(false); // Mặc định mở
  const [showColorsFilter, setShowColorsFilter] = useState(false); // Mặc định mở

  // Check if any filters are currently active (excluding pagination/sort)
  const areFiltersActive = useMemo(() => {
    return selectedBrandId !== null || selectedColorId !== null;
  }, [selectedBrandId, selectedColorId]);


  // Call hook to fetch product data by categorySlug with filters
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

  // Fetch data for filter options
  // Categories are generally not filtered directly on a category page, but used for breadcrumbs
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories({ limit: 100 });
  const allCategories = (categoriesResponse?.data as Category[]) || [];
  // visibleCategories and categoriesToShow are for `ProductsPage`, not usually needed here for sidebar filter
  // but keeping them if you intend to add a "related categories" filter later.
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
    return t('products_category_title_fallback');
  }, [productsResponse, t]);

  // --- Filter and Sort Handlers ---
  const handleColorClick = (colorId: number | null) => {
    setSelectedColorId(colorId === selectedColorId ? null : colorId);
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleBrandClick = (brandId: number | null) => {
    setSelectedBrandId(brandId === selectedBrandId ? null : brandId);
    setPage(1); // Reset to page 1 when filter changes
  };

  const resetFilters = useCallback(() => {
    setSelectedBrandId(null);
    setSelectedColorId(null);
    setSortBy('createdAt_desc'); // Reset sort as well
    setPage(1); // Reset to page 1
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1); // Reset to page 1 when sort changes
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <p className="ml-3 text-lg">{t('loading')}...</p>
      </div>
    );
  }

  // --- Error State or Category Not Found from API ---
  if (isError || (productsResponse && productsResponse.categoryInfo === null)) {
    console.error("Products fetch error or category not found:", error || "Category not found from API");
    if (productsResponse?.categoryInfo === null) {
      notFound(); // Triggers Next.js's 404 page
    }
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <h1 className="text-3xl font-bold mb-4">{t('error_loading_products')}</h1>
        <p>{error?.message || t('generic_error_message')}</p>
        <Link href={locale === 'vi' ? '/vi' : '/en'} className="text-blue-600 hover:underline mt-4 inline-block">
          {t('back_to_homepage')}
        </Link>
      </div>
    );
  }

  const products = productsResponse?.data || [];
  const totalProducts = productsResponse?.total || 0;

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top after page change
  };

  type SortOption = {
    value: string;
    label: string;
  };

  const sortOptions: SortOption[] = [
    { value: 'createdAt_desc', label: t('sort_by_newest') },
    { value: 'price_asc', label: t('sort_by_price_asc') },
    { value: 'price_desc', label: t('sort_by_price_desc') },
    { value: 'sold_desc', label: t('sort_by_sold_desc') },
    { value: 'averageRating_desc', label: t('sort_by_rating_desc') },
  ];

  return (
    <div className="container p-4 md:p-8 lg:p-12 mx-auto">
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href={locale === 'vi' ? '/vi' : '/en'}>
              {t('home')}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={locale === 'vi' ? '/vi/san-pham' : '/en/san-pham'}>
              {t('all_products_title')}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {categoryDisplayName}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-10 gap-8'>
        {/* Sidebar for filters */}
        <aside className="lg:col-span-2 overflow-y-auto lg:max-h-[calc(100vh-100px)] lg:sticky lg:top-24 pb-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-xl">{t('filters')}</span>
            {areFiltersActive && ( // Only show reset button if filters are active
              <Button size="small" onClick={resetFilters}>{t('reset')}</Button>
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
          <div className=""> {/* No border-b for the last section */}
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

        {/* Product display section */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {t('showing_products_total', {
                count: products.length, // Number of products on current page
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

          {/* Conditional rendering for product grid or "no products" message */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              {/* Display message when no products are found based on filters */}
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
                // Display message when category truly has no products (no filters applied)
                <p className="text-gray-600 text-lg">
                  {t('no_products_in_category')}
                </p>
              )}
            </div>
          )}


          {/* Pagination */}
          {totalProducts > limit && products.length > 0 && ( // Only show pagination if there's more than 1 page AND products are displayed
            <div className="flex justify-center mt-12">
              <Pagination
                current={page}
                pageSize={limit}
                total={totalProducts}
                onChange={handlePageChange}
                showSizeChanger={false} // Can enable if you want users to change limit
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}