// src/hooks/color/useCreateColor.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const useCreateColor = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      // Nếu color chỉ có các trường text (title, code) thì không cần FormData
      // Nhưng nếu có file ảnh (nếu bạn thêm) thì cần dùng FormData

      // Ở đây giả sử color chỉ có title và code (chuỗi), dùng JSON bình thường
      const res = await api.post('/colors', data)
      return res.data
    },
  })
}
