'use client'

import { useTranslation } from 'react-i18next'

export default function AdminPage() {
  const { t } = useTranslation()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('admin.title')}</h1>
      <p>{t('admin.description')}</p>
    </div>
  )
}
