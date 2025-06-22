// src/hooks/order/useUpdateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order, UpdateOrderDto } from '@/types/order/order.type'; // Đảm bảo đường dẫn đúng
import { OrderStatus } from '@/enums/order.enums';

// Định nghĩa một interface cho payload của mutation
interface UpdateOrderMutationPayload {
  id: number;
  status: OrderStatus; // Hoặc UpdateOrderDto nếu bạn muốn cho phép cập nhật nhiều trường
}

export const useUpdateOrder = () => { // KHÔNG NHẬN orderId ở đây
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateOrderMutationPayload) => { // NHẬN payload ở đây
      const res = await api.put(`/orders/${payload.id}`, { status: payload.status });
      return res.data;
    },
    onSuccess: (_, variables) => { // Sử dụng variables để lấy id từ payload
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};