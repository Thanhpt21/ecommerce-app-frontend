// src/hooks/brand/useBrands.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface UseBrandsParams {
  page?: number
  limit?: number
  search?: string
}

export const useBrands = ({
  page = 1,
  limit = 10,
  search = '',
}: UseBrandsParams) => {
  return useQuery({
    queryKey: ['brands', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/brands', {
        params: { page, limit, search },
      })
      return {
        data: res.data.data,
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      }
    },
  })
}
