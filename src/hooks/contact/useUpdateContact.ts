// src/hooks/contact/useUpdateContact.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { api } from '@/lib/axios';
import { UpdateContactPayload } from '@/types/contact.type'; // Import payload interface

// Đây là interface định nghĩa CÁI GÌ SẼ ĐƯỢC TRUYỀN VÀO mutationFn
interface UpdateContactMutationArgs {
  id: number;
  payload: UpdateContactPayload; // Đã có payload ở đây
}

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn nhận một đối số duy nhất có kiểu UpdateContactMutationArgs
    mutationFn: async ({ id, payload }: UpdateContactMutationArgs) => {
      const res = await api.put(`/contacts/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Cập nhật liên hệ thất bại.');
    },
  });
};