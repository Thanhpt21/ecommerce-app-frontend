// components/Header.tsx
'use client';

import { Button, Input, Menu, Dropdown, Badge, Spin } from 'antd';
import { MenuOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, HeartOutlined, LoadingOutlined, DownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLocaleContext } from '@/context/LocaleContext';
import { usePathname, useRouter } from 'next/navigation';
import { Config } from '@/types/config.type';
import Image from 'next/image';
import { useCart } from '@/stores/cartStore';
import { useWishlist } from '@/stores/useWishlistStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { useMemo, useEffect, useState } from 'react'; 
import { useAuth } from '@/context/AuthContext'; // **Sử dụng useAuth thay vì useCurrent**
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { Category } from '@/types/category.type';

interface HeaderProps {
  config: Config;
}

const Header = ({ config }: HeaderProps) => {
  const { t } = useTranslation('common');
  const { locale, changeLocale } = useLocaleContext();
  const pathname = usePathname();
  const router = useRouter();


  // Cart
  const { items: cartItems } = useCart();
  const cartItemCount = cartItems.length;

  // Wishlist
  const { items: wishlistItems } = useWishlist();
  const wishlistItemCount = wishlistItems.length;

  // User Auth - **Sử dụng useAuth**
  const { currentUser, isLoading: isAuthLoading } = useAuth(); // Lấy currentUser và isLoading từ AuthContext
  const { logoutUser: logoutUser, isPending: isLogoutPending } = useLogout(); // isLogoutPending là của useTransition
  
  // Dùng state cục bộ để quản lý trạng thái đăng nhập cho UI ngay lập tức
   const isLoggedInUI = currentUser !== undefined;


  const isAdmin = currentUser?.role === 'admin'; // Chú ý: vai trò thường là 'ADMIN' hoặc 'USER' (viết hoa)
  // const [logoutLoading, setLogoutLoading] = useState(false); // **Có thể bỏ state này**

  // Fetch Product Categories
  const { data: productCategories, isLoading: isLoadingProductCategories } = useAllCategories();

  // Extract category slugs for quick lookup (use useMemo for optimization)
  const categorySlugs = useMemo(() => {
    return new Set<string>((productCategories as Category[] | undefined)?.map((cat: Category) => cat.slug) || []);
  }, [productCategories]);

  const navigationItemsConfig = [
    { labelKey: 'home', viHref: '/vi', enHref: '/en', key: 'home' },
    { labelKey: 'about_us', viHref: '/vi/gioi-thieu', enHref: '/en/about-us', key: 'about_us' },
    { labelKey: 'products', viHref: '/vi/san-pham', enHref: '/en/products', key: 'products', hasDropdown: true },
    { labelKey: 'blog', viHref: '/vi/tin-tuc', enHref: '/en/blog', key: 'blog' },
    { labelKey: 'contact', viHref: '/vi/lien-he', enHref: '/en/contact', key: 'contact' },
  ];

  // Use useMemo to optimize getSelectedKey
  const getSelectedKey = useMemo(() => {
    const currentLocalePrefix = locale === 'vi' ? '/vi' : '/en';
    const pathWithoutLocale = pathname.startsWith(currentLocalePrefix) ? pathname.substring(currentLocalePrefix.length) : pathname;
    const pathSegments = pathWithoutLocale.split('/').filter(segment => segment);

    if (pathname === currentLocalePrefix) {
      return ['home'];
    }

    const potentialCategorySlug = pathSegments[0];
    if (potentialCategorySlug && categorySlugs.has(potentialCategorySlug)) {
      return ['products'];
    }

    for (const item of navigationItemsConfig) {
      if (item.key === 'home' || item.key === 'products') continue;

      const itemHref = locale === 'vi' || !locale ? item.viHref : item.enHref;

      if (pathname === itemHref) {
        return [item.key];
      }
      
      if (pathname.startsWith(itemHref + '/')) {
        return [item.key];
      {/* Search */}
        
      }
    }
    return ['']; 
  }, [pathname, locale, categorySlugs]);

  const handleLogout = () => {
    logoutUser(); // Gọi hook logout đã được cập nhật
  };

  const userDropdownMenu = (
    <Menu>
      {isAuthLoading ? ( // Hiển thị loading nếu AuthContext đang tải dữ liệu user
        <Menu.Item key="loading-user" disabled>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
          {t('loading')}...
        </Menu.Item>
      ) : isLoggedInUI ? (
        <>
          <Menu.Item key="account">
            <Link href={locale === 'vi' || !locale ? '/vi/tai-khoan' : '/en/account'}>
              {t('account')}
            </Link>
          </Menu.Item>
          {isAdmin && (
            <Menu.Item key="admin">
              <Link href={locale === 'vi' || !locale ? '/vi/admin' : '/en/admin'}>
                {t('admin_panel')}
              </Link>
            </Menu.Item>
          )}
          <Menu.Item key="logout" onClick={handleLogout}>
            {isLogoutPending ? ( // Sử dụng isLogoutPending trực tiếp
              <span>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
                {t('logout')}
              </span>
            ) : (
              t('logout')
            )}
          </Menu.Item>
        </>
      ) : (
        <Menu.Item key="login">
          <Link href={locale === 'vi' || !locale ? '/vi/login' : '/en/login'}>
            {t('login')}
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
          {t('loading')}...
        </Menu.Item>
      ) : productCategories && productCategories.length > 0 ? (
        productCategories.map((category: Category) => (
          <Menu.Item key={`product-category-${category.id}`}>
            <Link href={locale === 'vi' || !locale ? `/${locale}/${category.slug}` : `/${locale}/${category.slug}`}>
              {category.title}
            </Link>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="no-product-categories" disabled>
          {t('no_categories_available')}
        </Menu.Item>
      )}
    </Menu>
  );

  const mobileMenuItems = (
    <Menu selectedKeys={getSelectedKey} className="w-full">
      {navigationItemsConfig.map(item => {
        const href = locale === 'vi' || !locale ? item.viHref : item.enHref;
        
        if (item.hasDropdown) {
          const dropdownMenu = productCategoriesMenu;
          return (
            <Menu.SubMenu key={item.key} title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{t(item.labelKey)}</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            }>
              <Menu.Item key={`${item.key}-all`}>
                <Link href={href}>{t('all')}</Link>
              </Menu.Item>
              {dropdownMenu.props.children}
            </Menu.SubMenu>
          );
        }
        return (
          <Menu.Item key={item.key}>
            <Link href={href}>{t(item.labelKey)}</Link>
          </Menu.Item>
        );
      })}
      <Menu.Divider />
      <Menu.Item key="cart-mobile">
        <Link href={locale === 'vi' || !locale ? '/vi/gio-hang' : '/en/cart'}>
          <ShoppingCartOutlined className="mr-2" />
          {t('cart')}
          {cartItemCount > 0 && <span className="ml-1 text-xs">({cartItemCount})</span>}
        </Link>
      </Menu.Item>
      <Menu.Item key="wishlist-mobile">
        <Link href={locale === 'vi' || !locale ? '/vi/yeu-thich' : '/en/wishlist'}>
          <HeartOutlined className="mr-2" />
          {t('wishlist')}
          {wishlistItemCount > 0 && <span className="ml-1 text-xs">({wishlistItemCount})</span>}
        </Link>
      </Menu.Item>
      <Menu.SubMenu key="user-mobile" title={<><UserOutlined className="mr-2" />{t('account')}</>}>
        {isAuthLoading ? ( // Hiển thị loading nếu AuthContext đang tải dữ liệu user
          <Menu.Item key="loading-user-mobile" disabled>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
            {t('loading')}...
          </Menu.Item>
        ) : isLoggedInUI ? (
          <>
            <Menu.Item key="account-mobile-link">
              <Link href={locale === 'vi' || !locale ? '/vi/tai-khoan' : '/en/account'}>
                {t('account')}
              </Link>
            </Menu.Item>
            {isAdmin && (
              <Menu.Item key="admin-mobile-link">
                <Link href={locale === 'vi' || !locale ? '/vi/admin' : '/en/admin'}>
                  {t('admin_panel')}
                </Link>
              </Menu.Item>
            )}
            <Menu.Item key="logout-mobile" onClick={handleLogout}>
              {isLogoutPending ? (
                <span>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} className="mr-2" />
                  {t('logout')}
                </span>
              ) : (
                t('logout')
              )}
            </Menu.Item>
          </>
        ) : (
          <Menu.Item key="login-mobile-link">
            <Link href={locale === 'vi' || !locale ? '/vi/login' : '/en/login'}>
              {t('login')}
            </Link>
          </Menu.Item>
        )}
      </Menu.SubMenu>
      <Menu.Divider />
      <Menu.Item key="lang-mobile" onClick={() => changeLocale(locale === 'vi' ? 'en' : 'vi')}>
        {locale === 'vi' ? 'EN' : 'VI'}
      </Menu.Item>
    </Menu>
  );

  const handleUserIconTrigger = () => {
    // Nếu chưa đăng nhập, chuyển hướng.
    // Nếu đã đăng nhập, Dropdown của Ant Design sẽ tự xử lý việc mở/đóng.
    if (!isLoggedInUI) {
      router.push(locale === 'vi' || !locale ? '/vi/login' : '/en/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 lg:px-12 md:px-8 p-4 container mx-auto">
        <Link href={locale === 'vi' || !locale ? '/vi' : '/en'} className="flex items-center">
          {config.logo ? (
            <Image
              src={config.logo}
              alt={config.name || t('site_title')}
              width={60}
              height={15}
              className="h-auto object-contain"
            />
          ) : (
            <span className="font-bold text-xl text-blue-600">
              {config.name || t('site_title')}
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
              const href = locale === 'vi' || !locale ? item.viHref : item.enHref;

              if (item.hasDropdown) {
                const dropdownMenu = productCategoriesMenu;
                return (
                  <Menu.SubMenu
                    key={item.key}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className='font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200'>{t(item.labelKey)}</span>
                        <DownOutlined style={{ fontSize: '12px' }} />
                      </div>
                    }
                    className="!px-4 !py-2 !h-auto"
                  >
                    <Menu.Item key={`${item.key}-all`}>
                      <Link href={href}>{t('all')}</Link>
                    </Menu.Item>
                    {dropdownMenu.props.children}
                  </Menu.SubMenu>
                );
              }
              return (
                <Menu.Item key={item.key} className="!px-4 !py-2 !h-auto">
                  <Link href={href} className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                    {t(item.labelKey)}
                  </Link>
                </Menu.Item>
              );
            })}
          </Menu>
        </div>

        {/* Right Section: Search, Lang Toggle, Cart, Wishlist, User */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center relative border border-gray-300 rounded-md overflow-hidden">
            <Input
              type="search"
              placeholder={t('search')}
              className="pr-8 bg-transparent border-none focus:!shadow-none focus:!border-none"
              suffix={
                <SearchOutlined
                  className="cursor-pointer text-gray-500 hover:!text-blue-500 transition-colors duration-200"
                  onClick={() => alert(t('search_alert'))}
                />
              }
            />
          </div>

          {/* Language Toggle Button (Desktop) */}
          <Button
            type="default"
            className="hidden md:block"
            onClick={() => changeLocale(locale === 'vi' ? 'en' : 'vi')}
          >
            {locale === 'vi' ? 'EN' : 'VI'}
          </Button>

          <div className="hidden md:flex items-center space-x-2">
            {/* Wishlist Icon */}
            <Link href={locale === 'vi' || !locale ? '/vi/yeu-thich' : '/en/wishlist'}>
              <Badge count={wishlistItemCount} offset={[-5, 5]} showZero={false}>
                <Button type="text" icon={<HeartOutlined />} className="!text-gray-700 hover:!text-red-500" />
              </Badge>
              <span className="sr-only">{t('wishlist')}</span>
            </Link>

            {/* Cart Icon */}
            <Link href={locale === 'vi' || !locale ? '/vi/gio-hang' : '/en/cart'}>
              <Badge count={cartItemCount} offset={[-5, 5]} showZero={false}>
                <Button type="text" icon={<ShoppingCartOutlined />} className="!text-gray-700 hover:!text-blue-600" />
              </Badge>
              <span className="sr-only">{t('cart')}</span>
            </Link>

              {isLoggedInUI ? ( // Nếu đã đăng nhập, hiển thị Dropdown
              <Dropdown 
                overlay={userDropdownMenu} 
                trigger={['click']} // Chỉ trigger bằng click
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className="!text-gray-700 hover:!text-blue-600"
                  onClick={handleUserIconTrigger} // Sử dụng handleUserIconTrigger
                  disabled={isAuthLoading || isLogoutPending}
                  loading={isLogoutPending}
                />
              </Dropdown>
            ) : ( // Nếu chưa đăng nhập, chỉ hiển thị Button chuyển hướng
              <Button
                type="text"
                icon={<UserOutlined />}
                className="!text-gray-700 hover:!text-blue-600"
                onClick={handleUserIconTrigger} // Vẫn sử dụng hàm này để chuyển hướng
                disabled={isAuthLoading || isLogoutPending}
                loading={isLogoutPending}
              />
            )}
            <span className="sr-only">{t('account')}</span>
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