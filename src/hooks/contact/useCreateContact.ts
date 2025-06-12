// src/hooks/contact/useCreateContact.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd'; // Sử dụng Ant Design message cho thông báo
import { api } from '@/lib/axios'; // Đảm bảo đường dẫn này đúng
import { CreateContactPayload } from '@/types/contact.type';


export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateContactPayload) => {
      const res = await api.post('/contacts', dto);
      return res.data;
    },
    onSuccess: () => {
      // Sau khi tạo thành công, làm mất hiệu lực cache của query 'contacts'
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      message.success('Gửi liên hệ thành công!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tạo liên hệ thất bại.');
    },
  });
};