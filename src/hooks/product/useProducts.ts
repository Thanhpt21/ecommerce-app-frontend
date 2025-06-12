// src/hooks/product/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Product } from '@/types/product.type'; // Đảm bảo import interface Product

interface UseProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brandId?: number; // Thêm brandId
  colorId?: number; // Thêm colorId
  sortBy?: string;
  price_gte?: number; // Thêm price_gte
  price_lte?: number; // Thêm price_lte
}

export const useProducts = ({
  page = 1,
  limit = 12,
  search = '',
  categoryId,
  brandId,
  colorId,
  sortBy,
  price_gte, 
  price_lte, 
}: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', page, limit, search, categoryId, brandId, colorId, sortBy, price_gte, price_lte], 
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { page, limit, search, categoryId, brandId, colorId, sortBy, price_gte, price_lte }, 
      });
      return {
        data: res.data.data as Product[],
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};