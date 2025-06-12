import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateBlog = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};
