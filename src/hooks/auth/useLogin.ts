// hooks/auth/useLogin.ts
'use client'

import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query' // Thêm useQueryClient
import { login, LoginBody } from '@/lib/auth/login'

interface LoginResponse {
  success: boolean
  message: string
  access_token: string
  user: {
    id: number
    name: string
    email: string
    role: string
    phoneNumber: string | null
    gender: string | null
    type_account: string
    isActive: boolean
  }
}

import { useRouter } from 'next/navigation'

export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginBody> => {
  const router = useRouter()
  const queryClient = useQueryClient() // Khởi tạo queryClient

  return useMutation<LoginResponse, Error, LoginBody>({
    mutationFn: login,
    onSuccess: (data) => {
      // Khi đăng nhập thành công:
      // 1. Invalidate (vô hiệu hóa) query 'current-user'
      // Điều này sẽ khiến useCurrent (nơi sử dụng queryKey: ['current-user'])
      // tự động fetch lại dữ liệu mới nhất.
      queryClient.invalidateQueries({ queryKey: ['current-user'] });

      // 2. Optional: Lưu access_token vào localStorage/sessionStorage nếu bạn không dùng httpOnly cookies
      // Nếu backend của bạn thiết lập httpOnly cookie, thì bước này không cần thiết.
      // Nếu bạn muốn lưu token để dùng cho các request sau (Bearer Token), bạn có thể làm:
      // localStorage.setItem('access_token', data.access_token);
      // (Đảm bảo bạn cũng có logic để gửi token này trong các request sau)

      // 3. Chuyển hướng người dùng
      router.push('/vi') // hoặc `/[locale]/admin` tuỳ theo locale hiện tại
    },
    onError: (error) => {
      // Xử lý lỗi đăng nhập, ví dụ hiển thị thông báo
      console.error("Login failed:", error.message);
    }
  })
}