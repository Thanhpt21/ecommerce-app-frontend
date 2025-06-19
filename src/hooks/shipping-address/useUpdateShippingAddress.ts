import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ShippingAddress } from '@/types/shipping-address.type';

// Cấu trúc payload mà hook này NHẬN VÀO từ component
// Vẫn giữ 'id' và 'data' để dễ dàng sử dụng từ frontend
interface UpdateShippingAddressPayload {
  id: number;
  // Kiểu của 'data' ở đây chính là kiểu của request body mà backend mong muốn
  data: Omit<ShippingAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | 'orders'> & { isDefault?: boolean };
}

export const useUpdateShippingAddress = () => {
  return useMutation({
    // mutationFn sẽ nhận vào payload mà chúng ta định nghĩa ở trên
    mutationFn: async ({ id, data }: UpdateShippingAddressPayload) => {
      // Backend của bạn đang mong đợi request body CHỈ chứa các trường dữ liệu của địa chỉ
      // chứ không phải một đối tượng { id: ..., data: ... }
      // Vì vậy, chúng ta gửi trực tiếp `data` làm body của request PUT.
      // `id` sẽ được dùng làm tham số trong URL.
      const res = await api.put(`/shipping-address/${id}`, data);
      return res.data;
    },
  });
};