// hooks/category/useCategoryOne.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCategoryOne = (id?: number | string) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['category', id],
    queryFn: async () => {
      const res = await api.get(`/categories/${id}`)
      return res.data
    },
  })
}
