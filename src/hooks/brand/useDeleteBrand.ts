// src/hooks/brand/useDeleteBrand.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useDeleteBrand = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/brands/${id}`)
      return res.data
    },
  })
}