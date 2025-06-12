// src/hooks/order/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order } from '@/types/order/order.type'; // Đảm bảo import các types cần thiết
import { OrderStatus, PaymentMethod } from '@/enums/order.enums';

interface UseOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: OrderStatus; // Thêm statusFilter
  paymentMethodFilter?: PaymentMethod; // Thêm paymentMethodFilter
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageCount: number;
}

export const useOrders = ({
  page = 1,
  limit = 10,
  search = '',
  statusFilter,
  paymentMethodFilter,
}: UseOrdersParams) => {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders', page, limit, search, statusFilter, paymentMethodFilter],
    queryFn: async () => {
      const res = await api.get('/orders', { // Thay đổi endpoint nếu cần
        params: { page, limit, search, status: statusFilter, paymentMethod: paymentMethodFilter },
      });
      return res.data as OrdersResponse;
    },
  });
};