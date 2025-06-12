'use client';

import { Image, Layout, Menu } from 'antd';
import { AppleOutlined, AppstoreOutlined, BgColorsOutlined, BranchesOutlined, DashboardOutlined, FileProtectOutlined, GiftOutlined, HomeOutlined, MessageOutlined, PicLeftOutlined, PicRightOutlined, ProductOutlined, ScissorOutlined, SettingOutlined, SkinOutlined, SolutionOutlined, TruckOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

interface SidebarAdminProps {
  collapsed: boolean;
}

export default function SidebarAdmin({ collapsed }: SidebarAdminProps) {
  const locale = useLocale();
  return (
    <Layout.Sider
      trigger={null} // Ẩn trigger mặc định
      collapsible
      collapsed={collapsed}
      className="!bg-white shadow"
      style={{ backgroundColor: '#fff' }}
    >
      <div className=" text-center py-4">
        <Image
          src="https://www.sfdcpoint.com/wp-content/uploads/2019/01/Salesforce-Admin-Interview-questions.png" // Replace with the actual content_id
          alt="Admin Logo"
          width={collapsed ? 40 : 80} // Adjust width based on collapsed state
          preview={false}
        />
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          {
            key: '1',
            icon: <DashboardOutlined />,
            label: <Link href={`/${locale}/admin`}>Dashboard</Link>,
          },
          {
            key: '2',
            icon: <UserOutlined />,
            label: <Link href={`/${locale}/admin/users`}>Tài khoản</Link>,
          },
           {
            key: '11',
            icon: <ProductOutlined />,
            label: <Link href={`/${locale}/admin/product`}>Sản phẩm</Link>,
          },
          {
            key: '12',
            icon: <SolutionOutlined />,
            label: <Link href={`/${locale}/admin/blog`}>Tin tức</Link>,
          },
          {
            key: '13',
            icon: <FileProtectOutlined />,
            label: <Link href={`/${locale}/admin/order`}>Đơn hàng</Link>,
          },
           {
            key: '15',
            icon: <MessageOutlined />,
            label: <Link href={`/${locale}/admin/contact`}>Liên hệ</Link>,
          },
          {
            key: 'sub1',
            icon: <UnorderedListOutlined />,
            label: 'Danh mục',
            children: [
              { key: '3', icon: <PicLeftOutlined />, label: <Link href={`/${locale}/admin/category`}>Sản phẩm</Link> },
              { key: '4', icon: <PicRightOutlined />, label: <Link href={`/${locale}/admin/blog-category`}>Tin tức</Link> },
            ],
          },
           {
            key: 'sub2',
            icon: <AppstoreOutlined />,
            label: 'Thuộc tính',
            children: [
              { key: '5',icon: <AppleOutlined />, label: <Link href={`/${locale}/admin/brand`}>Thương hiệu</Link> },
              { key: '6', icon: <BgColorsOutlined />, label: <Link href={`/${locale}/admin/color`}>Màu sắc</Link> },
              { key: '7', icon: <ScissorOutlined />, label: <Link href={`/${locale}/admin/size`}>Kích thước</Link> },
            ],
          },
           {
            key: 'sub3',
            icon: <AppstoreOutlined />,
            label: 'Marketing',
            children: [
              { key: '8',icon: <GiftOutlined />, label: <Link href={`/${locale}/admin/coupon`}>Mã giảm giá</Link> },

            ],
          },
           {
            key: 'sub4',
            icon: <BranchesOutlined />,
            label: 'Cấu hình',
            children: [
              { key: '9',icon: <HomeOutlined />, label: <Link href={`/${locale}/admin/store`}>Chi nhánh</Link> },
              { key: '10',icon: <SettingOutlined />, label: <Link href={`/${locale}/admin/config`}>Cài đặt</Link> },
              { key: '14',icon: <TruckOutlined />, label: <Link href={`/${locale}/admin/shipping`}>Phí vận chuyển</Link> },
            ],
          },
        ]}
      />
    </Layout.Sider>
  );
}