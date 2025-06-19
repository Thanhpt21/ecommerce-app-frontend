// hooks/product/useProductSizes.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductSizeDetail } from '@/types/product.type';

export const useProductSizes = (productId?: number) => {
  return useQuery({
    queryKey: ['productSizes', productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await api.get(`/products/${productId}/sizes`);
      // Giờ đây, res.data.data sẽ được coi là Size[] bao gồm cả 'quantity'
      return res.data.data as ProductSizeDetail[];
    },
    enabled: !!productId,
  });
};