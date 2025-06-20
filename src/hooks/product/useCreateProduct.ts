// src/hooks/product/useCreateProduct.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useCreateProduct = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => { // Nhận trực tiếp FormData
            const res = await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
    });
};