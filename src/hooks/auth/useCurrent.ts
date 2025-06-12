// hooks/auth/useCurrent.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth/current'; // Giả định đây là hàm fetch user của bạn

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string | null;
  gender: string | null;
  type_account: string;
  isActive: boolean;
}

export const useCurrent = () => {
  return useQuery<CurrentUser, Error>({
    queryKey: ['current-user'], // Đây là key mà useLogin sẽ invalidate
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // Ví dụ: dữ liệu được coi là 'fresh' trong 5 phút
    retry: false, // Tùy chọn: không retry nếu lỗi (ví dụ: 401 khi chưa đăng nhập)
    // Các tùy chọn khác tùy thuộc vào cách bạn xử lý authentication
  });
};