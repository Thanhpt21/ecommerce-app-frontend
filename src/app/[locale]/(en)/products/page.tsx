// app/[locale]/products/page.tsx
'use client';

import { useTranslation } from 'react-i18next';

// Dữ liệu sản phẩm mẫu (tạm thời) - có thể dùng chung
const products = [
  { id: 1, name: 'Product 1', price: '$100.00' },
  { id: 2, name: 'Product 2', price: '$200.00' },
  { id: 3, name: 'Product 3', price: '$150.00' },
];

export default function ProductsPage() {
  const { t } = useTranslation('products');

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-md p-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600">{t('price')}: {product.price}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
              {t('add_to_cart')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}