// src/hooks/config/useUpdateConfig.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Config } from '@/types/config.type'; // Đảm bảo import interface Config

interface UpdateConfigPayload {
  id: number;
  data: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>;
  logoFile?: File | null;
}

export const useUpdateConfig = () => {
  return useMutation({
    mutationFn: async ({ id, data, logoFile }: UpdateConfigPayload) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      if (logoFile) {
        formData.append('file', logoFile);
      }

      const res = await api.put(`/configs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};