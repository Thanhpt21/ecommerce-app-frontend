// src/hooks/contact/useDeleteContact.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd'; // Sử dụng Ant Design message cho thông báo
import { api } from '@/lib/axios'; // Đảm bảo đường dẫn này đúng

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      message.success('Xóa liên hệ thành công!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Xóa liên hệ thất bại.');
    },
  });
};