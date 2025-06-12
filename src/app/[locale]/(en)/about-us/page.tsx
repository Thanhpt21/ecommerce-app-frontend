// app/[locale]/about-us/page.tsx
'use client';

import { useTranslation } from 'react-i18next';

export default function AboutUsPage() {
  const { t } = useTranslation('about_us');

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p>{t('content_1')}</p>
      <p className="mt-4">{t('content_2')}</p>
    </div>
  );
}