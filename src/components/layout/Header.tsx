'use client';

import { Button, Input, Menu, Dropdown, Badge, Spin } from 'antd';
import { MenuOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, HeartOutlined, LoadingOutlined, DownOutlined } from '@ant-design/icons';
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
  const { data: productCategories, isLoading: isLoadingProductCategories } = useAllCategories();

  // Extract category slugs for quick lookup (use useMemo for optimization)
  const categorySlugs = useMemo(() => {
    return new Set<string>((productCategories as Category[] | undefined)?.map((cat: Category) => cat.slug) || []);
  }, [productCategories]);

  const navigationItemsConfig = [
    { label: 'Trang chủ', href: '/', key: 'home' },
    { label: 'Giới thiệu', href: '/gioi-thieu', key: 'about_us' },
    { label: 'Sản phẩm', href: '/san-pham', key: 'products', hasDropdown: true },
    { label: 'Tin tức', href: '/tin-tuc', key: 'blog' },
    { label: 'Liên hệ', href: '/lien-he', key: 'contact' },
  ];

  // Use useMemo to optimize getSelectedKey
  const getSelectedKey = useMemo(() => {
    const pathSegments = pathname.split('/').filter(segment => segment);

    if (pathname === '/') {
      return ['home'];
    }

    const potentialCategorySlug = pathSegments[0];
    if (potentialCategorySlug && categorySlugs.has(potentialCategorySlug)) {
      return ['products'];
    }

    for (const item of navigationItemsConfig) {
      if (item.key === 'home' || item.key === 'products') continue;
      
      if (pathname === item.href) {
        return [item.key];
      }
      
      if (pathname.startsWith(item.href + '/')) {
        return [item.key];
      }
    }
    return ['']; 
  }, [pathname, categorySlugs]);

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
                Quản trị
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

  // Menu cho danh mục sản phẩm
  const productCategoriesMenu = (
    <Menu>
      {isLoadingProductCategories ? (
        <Menu.Item key="loading-products" disabled>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} className="mr-2" />
          Đang tải...
        </Menu.Item>
      ) : productCategories && productCategories.length > 0 ? (
        productCategories.map((category: Category) => (
          <Menu.Item key={`product-category-${category.id}`}>
            <Link href={`/${category.slug}`}>
              {category.title}
            </Link>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="no-product-categories" disabled>
          Không có danh mục nào
        </Menu.Item>
      )}
    </Menu>
  );

  const mobileMenuItems = (
    <Menu selectedKeys={getSelectedKey} className="w-full">
      {navigationItemsConfig.map(item => {
        if (item.hasDropdown) {
          const dropdownMenu = productCategoriesMenu;
          return (
            <Menu.SubMenu key={item.key} title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{item.label}</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            }>
              <Menu.Item key={`${item.key}-all`}>
                <Link href={item.href}>Tất cả</Link>
              </Menu.Item>
              {dropdownMenu.props.children}
            </Menu.SubMenu>
          );
        }
        return (
          <Menu.Item key={item.key}>
            <Link href={item.href}>{item.label}</Link>
          </Menu.Item>
        );
      })}
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
      <Menu.SubMenu key="user-mobile" title={<><UserOutlined className="mr-2" />Tài khoản</>}>
        {isAuthLoading ? (
          <Menu.Item key="loading-user-mobile" disabled>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
            Đang tải...
          </Menu.Item>
        ) : isLoggedInUI ? (
          <>
            <Menu.Item key="account-mobile-link">
              <Link href="/tai-khoan">
                Tài khoản
              </Link>
            </Menu.Item>
            {isAdmin && (
              <Menu.Item key="admin-mobile-link">
                <Link href="/admin">
                  Bảng điều khiển Admin
                </Link>
              </Menu.Item>
            )}
            <Menu.Item key="logout-mobile" onClick={handleLogout}>
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
          <Menu.Item key="login-mobile-link">
            <Link href="/login">
              Đăng nhập
            </Link>
          </Menu.Item>
        )}
      </Menu.SubMenu>
    </Menu>
  );

  const handleUserIconTrigger = () => {
    if (!isLoggedInUI) {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
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
            {navigationItemsConfig.map((item) => {
              if (item.hasDropdown) {
                const dropdownMenu = productCategoriesMenu;
                return (
                  <Menu.SubMenu
                    key={item.key}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className='font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200'>{item.label}</span>
                        <DownOutlined style={{ fontSize: '12px' }} />
                      </div>
                    }
                    className="!px-4 !py-2 !h-auto"
                  >
                    <Menu.Item key={`${item.key}-all`}>
                      <Link href={item.href}>Tất cả</Link>
                    </Menu.Item>
                    {dropdownMenu.props.children}
                  </Menu.SubMenu>
                );
              }
              return (
                <Menu.Item key={item.key} className="!px-4 !py-2 !h-auto">
                  <Link href={item.href} className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                    {item.label}
                  </Link>
                </Menu.Item>
              );
            })}
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