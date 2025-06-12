// src/hooks/order/useOrdersByUser.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order } from '@/types/order/order.type'; // Đảm bảo import type Order

interface UseOrdersByUserParams {
  userId?: number;
  page?: number;
  limit?: number;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageCount: number;
}

export const useOrdersByUser = ({ userId, page = 1, limit = 10 }: UseOrdersByUserParams) => {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders', 'user', userId, page, limit],
    queryFn: async () => {
      if (!userId) {
        return { data: [], total: 0, page: 1, pageCount: 0 }; // Hoặc throw error nếu userId bắt buộc
      }
      const res = await api.get('/orders/user', {
        params: { page, limit },
      });
      return res.data as OrdersResponse;
    },
    enabled: !!userId, // Chỉ chạy query khi có userId
  });
};