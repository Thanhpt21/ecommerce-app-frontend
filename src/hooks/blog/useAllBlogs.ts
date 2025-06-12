// src/hooks/blog/useAllBlogs.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Blog } from '@/types/blog.type';

// Define a type for the sort options to keep things type-safe and consistent
type BlogSortOption = 'newest' | 'oldest' | undefined; // 'most_viewed' if you plan to re-add it

export const useAllBlogs = (search?: string, sortBy?: BlogSortOption) => {
  return useQuery({
    // Include sortBy in the queryKey to refetch when sorting changes
    queryKey: ['allBlogs', search, sortBy],
    queryFn: async () => {
      const params: { search?: string; sortBy?: string } = {};

      if (search) {
        params.search = search;
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }

      const res = await api.get('/blogs/all', {
        params, // Pass the constructed params object
      });
      return res.data.data as Blog[];
    },
  });
};