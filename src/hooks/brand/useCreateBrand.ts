// src/hooks/brand/useCreateBrand.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateBrand = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any)
      })
      const res = await api.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
  })
}