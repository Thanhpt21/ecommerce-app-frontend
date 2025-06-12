// src/hooks/order/useOrder.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order } from '@/types/order/order.type';

export const useOrderOne = (orderId?: number) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data as Order;
    },
    enabled: !!orderId,
  });
};