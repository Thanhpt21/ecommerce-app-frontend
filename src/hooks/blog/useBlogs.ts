// src/hooks/blog/useBlogs.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Blog } from '@/types/blog.type'; // Đảm bảo import interface Blog

interface UseBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number; // Thêm categoryId vào params
}

export const useBlogs = ({
  page = 1,
  limit = 12,
  search = '',
  categoryId, // Nhận categoryId
}: UseBlogsParams) => {
  return useQuery({
    queryKey: ['blogs', page, limit, search, categoryId], // Thêm categoryId vào queryKey
    queryFn: async () => {
      const res = await api.get('/blogs', {
        params: { page, limit, search, categoryId }, // Thêm categoryId vào params
      });
      return {
        data: res.data.data as Blog[],
        total: res.data.total,
        page: res.data.page,
        pageCount: res.data.pageCount,
      };
    },
  });
};