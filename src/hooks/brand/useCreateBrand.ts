// src/hooks/brand/useCreateBrand.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateBrand = () => {
  return useMutation({
    // 'data' here is already the FormData object created in the frontend
    mutationFn: async (data: FormData) => {
      // Pass the FormData object directly to api.post
      const res = await api.post('/brands', data, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Explicitly setting this header is good, though axios often handles it for FormData
      })
      return res.data
    },
  })
}
