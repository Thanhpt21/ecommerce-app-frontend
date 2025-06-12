'use client';

import { useTranslation } from 'react-i18next';

interface AccountSidebarProps {
  onMenuClick: (key: 'personal' | 'address' | 'history') => void;
  selected: 'personal' | 'address' | 'history';
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ onMenuClick, selected }) => {
  const { t } = useTranslation('account');

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="font-semibold mb-4">{t('account_menu')}</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onMenuClick('personal')}
            className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${selected === 'personal' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            {t('personal_info')}
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuClick('address')}
            className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${selected === 'address' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            {t('shipping_address')}
          </button>
        </li>
        <li>
          <button
            onClick={() => onMenuClick('history')}
            className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${selected === 'history' ? 'bg-gray-200 font-semibold' : ''}`}
          >
            {t('purchase_history')}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AccountSidebar;