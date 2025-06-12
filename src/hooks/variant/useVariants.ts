// src/hooks/variant/useVariants.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Variant } from '@/types/product.type'; // Đảm bảo bạn có interface Variant

interface UseVariantsParams {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string | number; // Hoặc undefined
}

interface VariantsResponse {
  success: boolean;
  data: Variant[];
  total: number;
  page: number;
  pageCount: number;
}

export const useVariants = ({ productId }: UseVariantsParams) => {
  return useQuery<VariantsResponse, Error>({
    queryKey: ['variants', productId],
    queryFn: async () => {
      const res = await api.get('/variants', {
        params: { productId },
      });
      return res.data as VariantsResponse;
    },
    enabled: !!productId, // Chỉ fetch khi có productId
  });
};