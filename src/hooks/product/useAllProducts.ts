// src/hooks/product/useAllProducts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Product } from '@/types/product.type'; // Đảm bảo import interface Product

export const useAllProducts = (search?: string) => {
  return useQuery({
    queryKey: ['allProducts', search],
    queryFn: async () => {
      const res = await api.get('/products/all', { // Calls the /products/all endpoint
        params: { search },
      });
      return res.data.data as Product[]; // Expects the data to be in res.data.data and asserts it as Product[]
    },
  });
};