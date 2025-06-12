// src/hooks/variant/useUpdateVariant.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateVariantPayload {
  id: number;
  data: FormData; // Data là FormData
}

export const useUpdateVariant = () => {
  return useMutation({
    mutationFn: async (payload: UpdateVariantPayload) => {
      const res = await api.put(`/variants/${payload.id}`, payload.data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};