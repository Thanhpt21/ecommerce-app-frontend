// src/hooks/blog/useBlogBySlug.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Blog } from '@/types/blog.type';

interface UseBlogBySlugParams {
  slug: string;
  isPreview?: boolean;
}

export const useBlogBySlug = ({ slug, isPreview }: UseBlogBySlugParams) => {
  return useQuery({
    queryKey: ['blogs', slug, isPreview],
    queryFn: async () => {
      const res = await api.get(`/blogs/${slug}`, {
        params: { isPreview },
      });
      return res.data.data as Blog;
    },
    enabled: !!slug, // Chỉ fetch khi có slug
  });
};