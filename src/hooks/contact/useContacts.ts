// src/hooks/contact/useContacts.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Đảm bảo đường dẫn này đúng với instance axios của bạn
import { Contact, ContactApiResponse } from '@/types/contact.type'; // Giả sử bạn đã định nghĩa type Contact ở đây

// Định nghĩa interface cho dữ liệu phản hồi từ API


interface UseContactsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useContacts = ({ page = 1, limit = 10, search = '' }: UseContactsParams) => {
  return useQuery<any, Error, ContactApiResponse>({
    queryKey: ['contacts', page, limit, search],
    queryFn: async () => {
      const response = await api.get('/contacts', {
        params: { page, limit, search },
      });
      return response.data;
    },
 
  });
};