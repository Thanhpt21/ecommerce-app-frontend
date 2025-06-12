'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter, useSearchParams } from 'next/navigation'; // Import useRouter và useSearchParams
import AccountSidebar from '@/components/layout/account/AccountSidebar';
import PersonalInfo from '@/components/layout/account/PersonalInfo';
import ShippingAddress from '@/components/layout/account/ShippingAddress';
import PurchaseHistory from '@/components/layout/account/PurchaseHistory';

// Định nghĩa các loại tab hợp lệ để đảm bảo an toàn kiểu dữ liệu
type AccountMenuKey = 'personal' | 'address' | 'history';

const AccountPage = () => {
  const { t } = useTranslation('account');
  const router = useRouter(); // Khởi tạo router
  const searchParams = useSearchParams(); // Khởi tạo searchParams

  // Lấy giá trị của query parameter 'p' từ URL
  // Mặc định là 'personal' nếu không có hoặc không hợp lệ
  const initialMenu = (searchParams.get('p') as AccountMenuKey) || 'personal';
  const [selectedMenu, setSelectedMenu] = useState<AccountMenuKey>(initialMenu);

  // Sử dụng useEffect để cập nhật selectedMenu khi URL thay đổi
  useEffect(() => {
    const paramMenu = (searchParams.get('p') as AccountMenuKey);
    // Kiểm tra xem paramMenu có phải là một giá trị hợp lệ không
    if (['personal', 'address', 'history'].includes(paramMenu)) {
      setSelectedMenu(paramMenu);
    } else {
      // Nếu param không hợp lệ, đặt lại về 'personal' và cập nhật URL
      setSelectedMenu('personal');
      router.replace(`?p=personal`); // Dùng replace để không thêm vào lịch sử trình duyệt
    }
  }, [searchParams, router]); // Dependency array bao gồm searchParams và router

  // Hàm xử lý khi click vào menu sidebar
  const handleMenuClick = (key: AccountMenuKey) => {
    setSelectedMenu(key);
    // Cập nhật URL với query parameter mới
    router.push(`?p=${key}`);
  };

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">{t('account_info')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <AccountSidebar onMenuClick={handleMenuClick} selected={selectedMenu} />
        </div>
        <div className="md:col-span-3">
          {selectedMenu === 'personal' && <PersonalInfo />}
          {selectedMenu === 'address' && <ShippingAddress />}
          {selectedMenu === 'history' && <PurchaseHistory />}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;