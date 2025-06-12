// src/hooks/blog/useDeleteBlog.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteBlog = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/blogs/${id}`);
      return res.data;
    },
  });
};