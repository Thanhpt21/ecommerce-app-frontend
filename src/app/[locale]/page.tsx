'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button' // 👈 ShadCN Button

export default function Page() {
  const { t } = useTranslation('common')

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-red-500">{t('welcome')}</h1>
      <p>{t('hello')}</p>

    </div>
  )
}
