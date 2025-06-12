// app/gio-hang/page.tsx
'use client';

import ShoppingCart from '@/components/layout/cart/ShoppingCart';
import { useTranslation } from 'react-i18next';

function CartPage() {
  const { t } = useTranslation('cart');

  return (
    <div className="container lg:p-12 mx-auto p-4 md:p-8">
      <ShoppingCart />
    </div>
  );
}

export default CartPage;