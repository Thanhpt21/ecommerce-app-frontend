// src/hooks/order/useCreateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CreateOrderDto } from '@/types/order/order.type';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: CreateOrderDto) => {
      const res = await api.post('/orders', orderData);
      return res.data;
    },
    onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};