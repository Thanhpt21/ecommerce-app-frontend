// components/Footer.tsx
'use client';

import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// Imports icons từ Ant Design
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined, TwitterOutlined, GlobalOutlined, LinkOutlined } from '@ant-design/icons'; // Thêm GlobalOutlined cho Zalo/TikTok/LinkedIn/X
import { Input, Button, Space } from 'antd'; // Input và Button từ Ant Design
import { Config } from '@/types/config.type'; // <-- Đảm bảo import interface Config của bạn

// Định nghĩa interface cho props của Footer
interface FooterProps {
  config: Config; // Thêm prop config
}

const Footer = ({ config }: FooterProps) => { // Nhận config prop ở đây
  const { t } = useTranslation('common');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'vi'; // Lấy locale từ pathname

  return (
    <footer className="bg-gray-100 border-t py-12 text-sm text-gray-500 ">
      <div className='container mx-auto lg:px-12 md:px-8 p-4'>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Gọi mua hàng */}
        <div>
          <div className="flex items-center mb-2">
            <PhoneOutlined className="text-xl mr-2 text-blue-500" />
            <h6 className="font-semibold">{t('call_to_order')} (08:30 - 22:00)</h6>
          </div>
          {/* Sử dụng config.mobile */}
          <p className="text-blue-500 text-lg font-semibold">
            {config.mobile || '0963 646 444'}
          </p>
        </div>

        {/* Cột 2: Về chúng tôi */}
        <div>
          <h6 className="font-semibold mb-2">{t('about_us_title')}</h6>
          <ul className="list-none space-y-1">
            <li><Link href={`/${currentLocale}/gioi-thieu`} className="hover:underline">{t('about_us')}</Link></li>
            <li><Link href={`/${currentLocale}/san-pham`} className="hover:underline">{t('products')}</Link></li>
            <li><Link href={`/${currentLocale}/lien-he`} className="hover:underline">{t('contact')}</Link></li>
            <li><Link href={`/${currentLocale}/he-thong-cua-hang`} className="hover:underline">{t('store_system')}</Link></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ khách hàng và thông tin liên hệ */}
        <div>
          <h6 className="font-semibold mb-2">{t('customer_support')}</h6>
          <ul className="list-none space-y-1">
            <li><Link href={`/${currentLocale}/huong-dan-chon-size`} className="hover:underline">{t('select_size_guide')}</Link></li>
            <li><Link href={`/${currentLocale}/chinh-sach-khach-hang-than-thiet`} className="hover:underline">{t('loyalty_policy')}</Link></li>
            <li><Link href={`/${currentLocale}/cau-hoi-thuong-gap`} className="hover:underline">{t('faq')}</Link></li>
          </ul>
          <div className="mt-4">
            {/* Logo đã thông báo bộ công thương (thay thế bằng Link và hình ảnh thật) */}
            <Link href="#" className="inline-block mb-1">
              [Logo Bộ Công Thương] {/* Giữ nguyên placeholder */}
            </Link>
            {/* Sử dụng config.name */}
            <p className="text-xs">{config.name || t('company_name')}</p>
            <p className="text-xs flex items-center">
              <MailOutlined className="text-base mr-1" />
              {/* Sử dụng config.email */}
              {config.email || t('email')}
            </p>
            <p className="text-xs flex items-center">
              <EnvironmentOutlined className="text-base mr-1" />
              {/* Sử dụng config.address */}
              {config.address || t('address')}
            </p>
          </div>
        </div>

        {/* Cột 4: Đăng ký nhận khuyến mãi và Mạng xã hội */}
        <div>
          <h6 className="font-semibold mb-2">{t('subscribe_promotion')}</h6>
          <Space className="w-full mb-4">
            <Input
              type="email"
              placeholder={t('your_email')}
              className="flex-grow focus:!border-blue-500 focus:!shadow-none"
            />
            <Button type="primary" className="bg-blue-500 hover:!bg-blue-600 focus:!bg-blue-600">
              {t('send')}
            </Button>
          </Space >
          <div className="flex space-x-4">
            {/* Các liên kết mạng xã hội động */}
            {config.facebook && (
              <Link href={config.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <FacebookOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.x && ( // Đây có thể là Twitter nếu bạn muốn dùng icon TwitterOutlined
              <Link href={config.x} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <TwitterOutlined className="w-6 h-6" /> {/* Hoặc biểu tượng X nếu có */}
              </Link>
            )}
            {config.instagram && (
              <Link href={config.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <InstagramOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.youtube && (
              <Link href={config.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <YoutubeOutlined className="w-6 h-6" />
              </Link>
            )}
            {config.zalo && (
              <Link href={config.zalo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <GlobalOutlined className="w-6 h-6" /> {/* Icon chung cho Zalo */}
              </Link>
            )}
             {config.tiktok && (
              <Link href={config.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <LinkOutlined className="w-6 h-6" /> {/* Icon chung cho Tiktok nếu không có icon cụ thể */}
              </Link>
            )}
             {config.linkedin && (
              <Link href={config.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:opacity-80">
                <LinkOutlined className="w-6 h-6" /> {/* Icon chung cho Linkedin nếu không có icon cụ thể */}
              </Link>
            )}
          </div>
        </div>
        </div>
        <div className="px-4 md:px-6 mt-8 text-center text-xs">
          &copy; {new Date().getFullYear()} {config.name || t('site_title')}. {t('all_rights_reserved')}
        </div>
        </div>
    </footer>
  );
};

export default Footer;