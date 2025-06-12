// src/hooks/config/useConfigOne.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Config } from '@/types/config.type'; // Đảm bảo import interface Config

export const useConfigOne = () => {
  return useQuery({
    queryKey: ['config', 1], // Sử dụng id cố định là 1
    queryFn: async () => {
      const res = await api.get(`/configs/1`);
      return res.data.data as Config; // Giả định API trả về một đối tượng Config trong data
    },
  });
};