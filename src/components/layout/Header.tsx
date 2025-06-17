'use client';

import { Button, Input, Menu, Dropdown, Badge, Spin } from 'antd';
import { MenuOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, HeartOutlined, LoadingOutlined } from '@ant-design/icons'; // Removed DownOutlined
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Config } from '@/types/config.type';
import Image from 'next/image';
import { useCart } from '@/stores/cartStore';
import { useWishlist } from '@/stores/useWishlistStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { useMemo, useState } from 'react'; 
import { useAuth } from '@/context/AuthContext';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { Category } from '@/types/category.type';

interface HeaderProps {
  config: Config;
}

const Header = ({ config }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Cart
  const { items: cartItems } = useCart();
  const cartItemCount = cartItems.length;

  // Wishlist
  const { items: wishlistItems } = useWishlist();
  const wishlistItemCount = wishlistItems.length;

  // User Auth
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { logoutUser, isPending: isLogoutPending } = useLogout();
  
  const isLoggedInUI = currentUser !== undefined;

  const isAdmin = currentUser?.role === 'admin';

  // Fetch Product Categories
  const { data: allCategories, isLoading: isLoadingAllCategories } = useAllCategories();

  // Hàm trợ giúp để xây dựng cấu trúc cây danh mục
  const buildCategoryTree = (data: Category[], parentId: number | null = null): (Category & { children?: Category[] })[] => {
    return data
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(data, category.id),
      }));
  };

  // Tạo cây danh mục chỉ với các danh mục cha cấp cao nhất
  const categoriesTree = useMemo(() => {
    if (!allCategories) return [];
    return buildCategoryTree(allCategories, null);
  }, [allCategories]);

  // Extract all category slugs for quick lookup (for getSelectedKey)
  const allCategorySlugs = useMemo(() => {
    const slugs = new Set<string>();
    const collectSlugs = (categories: Category[]) => {
      categories.forEach(cat => {
        slugs.add(cat.slug);
        if (cat.children) {
          collectSlugs(cat.children);
        }
      });
    };
    if (allCategories) {
      collectSlugs(allCategories);
    }
    return slugs;
  }, [allCategories]);


  // Use useMemo to optimize getSelectedKey
  const getSelectedKey = useMemo(() => {
    const pathSegments = pathname.split('/').filter(segment => segment);

    // If pathname is root, no specific menu item will be selected in the main menu
    // as "Trang chủ" is removed. The logo still navigates to home.
    if (pathname === '/') {
      return ['']; // Or handle as needed if you have a default selection
    }

    // Check for category slugs (both parent and sub)
    if (pathSegments.length > 0 && allCategorySlugs.has(pathSegments[0])) {
        // Find the category by slug
        const activeCategory = allCategories?.find((cat: Category) => cat.slug === pathSegments[0]);
        if (activeCategory) {
            // If it's a subcategory, select its key. Its parent's submenu will automatically highlight.
            // If it's a top-level category, select its key.
            return [`cat-${activeCategory.id}`]; 
        }
    }
    
    // Fallback for other pages (Giới thiệu, Tin tức, Liên hệ moved to top bar)
    // No explicit selection for these in the main menu anymore
    return ['']; 
  }, [pathname, allCategorySlugs, allCategories]);

  const handleLogout = () => {
    logoutUser();
  };

  const userDropdownMenu = (
    <Menu>
      {isAuthLoading ? (
        <Menu.Item key="loading-user" disabled>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
          Đang tải...
        </Menu.Item>
      ) : isLoggedInUI ? (
        <>
          <Menu.Item key="account">
            <Link href="/tai-khoan">
              Tài khoản
            </Link>
          </Menu.Item>
          {isAdmin && (
            <Menu.Item key="admin">
              <Link href="/admin">
                Bảng điều khiển Admin
              </Link>
            </Menu.Item>
          )}
          <Menu.Item key="logout" onClick={handleLogout}>
            {isLogoutPending ? (
              <span>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
                Đăng xuất
              </span>
            ) : (
              'Đăng xuất'
            )}
          </Menu.Item>
        </>
      ) : (
        <Menu.Item key="login">
          <Link href="/login">
            Đăng nhập
          </Link>
        </Menu.Item>
      )}
    </Menu>
  );

  const mobileMenuItems = (
    <Menu selectedKeys={getSelectedKey} className="w-full">
      {isLoadingAllCategories ? (
        <Menu.Item key="loading-categories-mobile" disabled>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
          Đang tải danh mục...
        </Menu.Item>
      ) : (
        categoriesTree.map((category) => {
          if (category.children && category.children.length > 0) {
            return (
              <Menu.SubMenu
                key={`cat-${category.id}`}
                title={
                  // Removed DownOutlined from mobile submenu title
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{category.title}</span>
                    {/* The Ant Design Menu.SubMenu component for mobile will automatically add an arrow icon if there are children */}
                  </div>
                }
              >
                {/* Link to parent category (e.g., all products in that category) */}
                <Menu.Item key={`cat-${category.id}-all`}>
                  <Link href={`/${category.slug}`}>Tất cả {category.title}</Link>
                </Menu.Item>
                {category.children.map((subCategory) => (
                  <Menu.Item key={`subcat-${subCategory.id}`}>
                    <Link href={`/${subCategory.slug}`}>{subCategory.title}</Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            );
          }
          return (
            <Menu.Item key={`cat-${category.id}`}>
              <Link href={`/${category.slug}`}>{category.title}</Link>
            </Menu.Item>
          );
        })
      )}
      
      <Menu.Divider />
      {/* Moved to top bar: Giới thiệu, Tin tức, Liên hệ will be accessed via top bar.
          Keeping here for mobile if desired, or remove if strictly top bar only.
          For now, assume mobile menu can still list them if needed. */}
      <Menu.Item key="about-mobile">
        <Link href="/gioi-thieu">Giới thiệu</Link>
      </Menu.Item>
      <Menu.Item key="blog-mobile">
        <Link href="/tin-tuc">Tin tức</Link>
      </Menu.Item>
      <Menu.Item key="contact-mobile">
        <Link href="/lien-he">Liên hệ</Link>
      </Menu.Item>

      <Menu.Divider />
      <Menu.Item key="cart-mobile">
        <Link href="/gio-hang">
          <ShoppingCartOutlined className="mr-2" />
          Giỏ hàng
          {cartItemCount > 0 && <span className="ml-1 text-xs">({cartItemCount})</span>}
        </Link>
      </Menu.Item>
      <Menu.Item key="wishlist-mobile">
        <Link href="/yeu-thich">
          <HeartOutlined className="mr-2" />
          Danh sách yêu thích
          {wishlistItemCount > 0 && <span className="ml-1 text-xs">({wishlistItemCount})</span>}
        </Link>
      </Menu.Item>
    </Menu>
  );

  const handleUserIconTrigger = () => {
    if (!isLoggedInUI) {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* New Top Horizontal Bar - Hidden on mobile */}
      <div className="hidden md:flex h-8 bg-gray-100 items-center justify-end pr-8 pl-4 text-sm">
        <div className="space-x-4">
          <Link href="/gioi-thieu" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Giới thiệu</Link>
          <Link href="/tin-tuc" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Tin tức</Link>
          <Link href="/lien-he" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">Liên hệ</Link>
        </div>
      </div>

      <div className="flex items-center justify-between h-16 lg:px-12 md:px-8 p-4 container mx-auto">
        <Link href="/" className="flex items-center">
          {config.logo ? (
            <Image
              src={config.logo}
              alt={config.name || 'Tên trang web'}
              width={60}
              height={15}
              className="h-auto object-contain"
            />
          ) : (
            <span className="font-bold text-xl text-blue-600">
              {config.name || 'Tên trang web'}
            </span>
          )}
        </Link>

        {/* Navigation Menu (Desktop) */}
        <div className="hidden md:flex flex-grow justify-center items-center">
          <Menu
            mode="horizontal"
            className="flex-grow justify-center border-none"
            selectedKeys={getSelectedKey}
          >
        

            {isLoadingAllCategories ? (
              <Menu.Item key="loading-categories" disabled>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
                Đang tải danh mục...
              </Menu.Item>
            ) : (
              categoriesTree.map((category) => {
                if (category.children && category.children.length > 0) {
                  return (
                    <Menu.SubMenu
                      key={`cat-${category.id}`}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className='font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200'>{category.title}</span>
                          {/* FIX: Adjusted vertical alignment for the DownOutlined icon */}
                          <svg viewBox="64 64 896 896" focusable="false" data-icon="down" width="1em" height="1em" fill="currentColor" aria-hidden="true" style={{ fontSize: '12px', verticalAlign: 'middle' }}><path d="M884 256h-75c-5.1 0-9.9 2.1-13.3 5.7l-35.4 37.5L474 654.7c-3.6 3.6-8.4 5.7-13.3 5.7H456c-4.9 0-9.7-2.1-13.3-5.7L154 300.9l-35.4-37.5c-3.4-3.6-8.2-5.7-13.3-5.7H75c-6.8 0-10.5 8.1-6.1 13.5l356 397.6c3.6 4 8.6 6.5 13.9 6.5h38c5.3 0 10.3-2.5 13.9-6.5l356-397.6c4.4-5.4.7-13.5-6.1-13.5z"></path></svg>
                        </div>
                      }
                      className="!px-4 !py-2 !h-auto"
                    >
                      {/* Link to parent category (e.g., all products in that category) */}
                      <Menu.Item key={`cat-${category.id}-all`}>
                        <Link href={`/${category.slug}`}>Tất cả {category.title}</Link>
                      </Menu.Item>
                      {category.children.map((subCategory) => (
                        <Menu.Item key={`subcat-${subCategory.id}`}>
                          <Link href={`/${subCategory.slug}`}>{subCategory.title}</Link>
                        </Menu.Item>
                      ))}
                    </Menu.SubMenu>
                  );
                }
                return (
                  <Menu.Item key={`cat-${category.id}`} className="!px-4 !py-2 !h-auto">
                    <Link href={`/${category.slug}`} className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      {category.title}
                    </Link>
                  </Menu.Item>
                );
              })
            )}
          </Menu>
        </div>

        {/* Right Section: Search, Cart, Wishlist, User */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center relative border border-gray-300 rounded-md overflow-hidden">
            <Input
              type="search"
              placeholder="Tìm kiếm"
              className="pr-8 bg-transparent border-none focus:!shadow-none focus:!border-none"
              suffix={
                <SearchOutlined
                  className="cursor-pointer text-gray-500 hover:!text-blue-500 transition-colors duration-200"
                  onClick={() => alert('Chức năng tìm kiếm chưa khả dụng.')}
                />
              }
            />
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {/* Wishlist Icon */}
            <Link href="/yeu-thich">
              <Badge count={wishlistItemCount} offset={[-5, 5]} showZero={false}>
                <Button type="text" icon={<HeartOutlined />} className="!text-gray-700 hover:!text-red-500" />
              </Badge>
              <span className="sr-only">Danh sách yêu thích</span>
            </Link>

            {/* Cart Icon */}
            <Link href="/gio-hang">
              <Badge count={cartItemCount} offset={[-5, 5]} showZero={false}>
                <Button type="text" icon={<ShoppingCartOutlined />} className="!text-gray-700 hover:!text-blue-600" />
              </Badge>
              <span className="sr-only">Giỏ hàng</span>
            </Link>

            {isLoggedInUI ? (
              <Dropdown
                overlay={userDropdownMenu}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className="!text-gray-700 hover:!text-blue-600"
                  onClick={handleUserIconTrigger}
                  disabled={isAuthLoading || isLogoutPending}
                  loading={isLogoutPending}
                />
              </Dropdown>
            ) : (
              <Button
                type="text"
                icon={<UserOutlined />}
                className="!text-gray-700 hover:!text-blue-600"
                onClick={handleUserIconTrigger}
                disabled={isAuthLoading || isLogoutPending}
                loading={isLogoutPending}
              />
            )}
            <span className="sr-only">Tài khoản</span>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className="md:hidden">
            <Dropdown overlay={mobileMenuItems} trigger={['click']}>
              <Button type="text" icon={<MenuOutlined />} className="!text-gray-700 hover:!text-blue-600" />
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
