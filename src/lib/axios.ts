// lib/axios.ts
import axios, { AxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // Bắt buộc để gửi cookie trong request
})

// === XÓA BỎ HOẶC GHI CHÚ PHẦN INTERCEPTOR NÀY NẾU BẠN CHỈ DÙNG HTTP-ONLY COOKIE ===
// api.interceptors.request.use((config: AxiosRequestConfig) => {
//   if (typeof window !== 'undefined') {
//     const token = localStorage.getItem('accessToken') // Sẽ không tìm thấy nếu cookie là httpOnly
//     if (token) {
//       config.headers = config.headers || {}
//       config.headers['Authorization'] = `Bearer ${token}`
//     }
//   }
//   return config
// })