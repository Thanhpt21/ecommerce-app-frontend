// hooks/auth/useRegister.ts
'use client'

import { register, RegisterBody } from '@/lib/auth/register'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface RegisterResponse {
  success: boolean
  message: string
  data: {
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

export const useRegister = (): UseMutationResult<RegisterResponse, Error, RegisterBody> => {
  const router = useRouter()

  return useMutation<RegisterResponse, Error, RegisterBody>({
    mutationFn: register,
    onSuccess: (data) => {
      // Tùy chọn: Chuyển hướng người dùng sau khi đăng ký thành công
      // Ví dụ: về trang đăng nhập hoặc trang xác nhận email
      //router.push('/login') 
      router.push('/[locale]/login')
    },
    onError: (error) => {
      // Tùy chọn: Xử lý lỗi đăng ký (ví dụ: hiển thị thông báo lỗi)
      console.error('Đăng ký thất bại:', error.message);
    }
  })
}