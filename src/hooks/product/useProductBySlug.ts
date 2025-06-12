// src/hooks/product/useProductBySlug.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Product } from '@/types/product.type';

interface UseProductBySlugParams {
  slug: string;
}

export const useProductBySlug = ({ slug }: UseProductBySlugParams) => {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data.data as Product; // Assuming your API returns the product data directly
    },
    enabled: !!slug, // Chỉ fetch khi có slug
  });
};