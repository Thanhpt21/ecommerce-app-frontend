'use client';

import { Image, Layout, Menu } from 'antd';
import { AppleOutlined, AppstoreOutlined, BgColorsOutlined, BranchesOutlined, DashboardOutlined, FileProtectOutlined, GiftOutlined, HomeOutlined, MessageOutlined, PicLeftOutlined, PicRightOutlined, ProductOutlined, ScissorOutlined, SettingOutlined, SkinOutlined, SolutionOutlined, TruckOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface SidebarAdminProps {
  collapsed: boolean;
}

export default function SidebarAdmin({ collapsed }: SidebarAdminProps) {
  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="!bg-white shadow"
      style={{ backgroundColor: '#fff' }}
    >
      <div className=" text-center py-4">
        <Image
          src="https://www.sfdcpoint.com/wp-content/uploads/2019/01/Salesforce-Admin-Interview-questions.png"
          alt="Admin Logo"
          width={collapsed ? 40 : 80}
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
            label: <Link href="/admin">Dashboard</Link>,
          },
          {
            key: '2',
            icon: <UserOutlined />,
            label: <Link href="/admin/users">Tài khoản</Link>,
          },
          {
            key: '11',
            icon: <ProductOutlined />,
            label: <Link href="/admin/product">Sản phẩm</Link>,
          },
          {
            key: '12',
            icon: <SolutionOutlined />,
            label: <Link href="/admin/blog">Tin tức</Link>,
          },
          {
            key: '13',
            icon: <FileProtectOutlined />,
            label: <Link href="/admin/order">Đơn hàng</Link>,
          },
          {
            key: '15',
            icon: <MessageOutlined />,
            label: <Link href="/admin/contact">Liên hệ</Link>,
          },
          {
            key: 'sub1',
            icon: <UnorderedListOutlined />,
            label: 'Danh mục',
            children: [
              { key: '3', icon: <PicLeftOutlined />, label: <Link href="/admin/category">Sản phẩm</Link> },
              { key: '4', icon: <PicRightOutlined />, label: <Link href="/admin/blog-category">Tin tức</Link> },
            ],
          },
          {
            key: 'sub2',
            icon: <AppstoreOutlined />,
            label: 'Thuộc tính',
            children: [
              { key: '5', icon: <AppleOutlined />, label: <Link href="/admin/brand">Thương hiệu</Link> },
              { key: '6', icon: <BgColorsOutlined />, label: <Link href="/admin/color">Màu sắc</Link> },
              { key: '7', icon: <ScissorOutlined />, label: <Link href="/admin/size">Kích thước</Link> },
            ],
          },
          {
            key: 'sub3',
            icon: <AppstoreOutlined />,
            label: 'Marketing',
            children: [
              { key: '8', icon: <GiftOutlined />, label: <Link href="/admin/coupon">Mã giảm giá</Link> },
            ],
          },
          {
            key: 'sub4',
            icon: <BranchesOutlined />,
            label: 'Cấu hình',
            children: [
              { key: '9', icon: <HomeOutlined />, label: <Link href="/admin/store">Chi nhánh</Link> },
              { key: '10', icon: <SettingOutlined />, label: <Link href="/admin/config">Cài đặt</Link> },
              { key: '14', icon: <TruckOutlined />, label: <Link href="/admin/shipping">Phí vận chuyển</Link> },
            ],
          },
        ]}
      />
    </Layout.Sider>
  );
}