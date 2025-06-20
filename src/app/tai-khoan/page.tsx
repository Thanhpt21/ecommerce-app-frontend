'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountSidebar from '@/components/layout/account/AccountSidebar';
import PersonalInfo from '@/components/layout/account/PersonalInfo';
import ShippingAddress from '@/components/layout/account/ShippingAddress';
import PurchaseHistory from '@/components/layout/account/PurchaseHistory';

type AccountMenuKey = 'personal' | 'address' | 'history';

const AccountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMenu = (searchParams.get('p') as AccountMenuKey) || 'personal';
  const [selectedMenu, setSelectedMenu] = useState<AccountMenuKey>(initialMenu);

  useEffect(() => {
    const paramMenu = (searchParams.get('p') as AccountMenuKey);
    if (['personal', 'address', 'history'].includes(paramMenu)) {
      setSelectedMenu(paramMenu);
    } else {
      setSelectedMenu('personal');
      router.replace(`?p=personal`);
    }
  }, [searchParams, router]);

  const handleMenuClick = (key: AccountMenuKey) => {
    setSelectedMenu(key);
    router.push(`?p=${key}`);
  };

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>
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