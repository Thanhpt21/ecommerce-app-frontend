// src/hooks/variant/useDeleteVariant.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useDeleteVariant = () => {
  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/variants/${id}`);
      return res.data;
    },
  });
};