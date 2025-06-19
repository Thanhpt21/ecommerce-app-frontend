// src/hooks/variant-sizes/useVariantSizes.ts (hoặc bất cứ nơi nào hook này được định nghĩa)

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { VariantSizeDetail } from '@/types/variant.type'; // Import VariantSize đã định nghĩa

// Định nghĩa kiểu phản hồi từ API
interface FetchVariantSizesResponse {
  data: VariantSizeDetail[]; // Hoặc nếu API chỉ trả về mảng trực tiếp, thì chỉ cần `VariantSize[]`
  // Có thể có thêm total, page, pageCount nếu API phân trang
}

export const useVariantSizes = (variantId?: number) => {
  return useQuery<FetchVariantSizesResponse, Error>({
    queryKey: ['variantSizes', variantId],
    queryFn: async () => {
      // Đảm bảo URL API và cách truyền params là đúng cho việc lấy size của một variant
      const res = await api.get(`/variants/${variantId}/sizes`); // Ví dụ URL
      return res.data as FetchVariantSizesResponse; // Ép kiểu dữ liệu trả về
    },
    enabled: !!variantId, // Chỉ fetch khi có variantId
  });
};