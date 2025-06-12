// src/hooks/variant/useCreateVariant.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface CreateVariantPayload {
  productId: number;
  colorId?: number;
  price: number;
  discount?: number;
  thumb?: File;
  images?: File[];
  sku: string;
  sizeIds?: number[];
}

export const useCreateVariant = () => {
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await api.post('/variants', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};