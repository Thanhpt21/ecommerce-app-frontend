// src/hooks/brand/useAllBrands.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Đảm bảo đường dẫn đúng

export const useAllBrands = (search?: string) => {
  return useQuery({
    queryKey: ['allBrands', search],
    queryFn: async () => {
      const res = await api.get('/brands/all', { // Gọi endpoint /brands/all
        params: { search },
      });
      return res.data.data; // Dữ liệu trả về trong res.data.data
    },
  });
};