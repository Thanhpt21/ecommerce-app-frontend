// src/hooks/order/useDeleteOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteOrder = () => { // Không nhận `orderId` ở đây
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderIdToDelete: number) => { // Nhận `orderId` khi gọi `mutateAsync`
      const res = await api.delete(`/orders/${orderIdToDelete}`);
      return res.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};