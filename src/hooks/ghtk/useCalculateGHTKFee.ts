// src/hooks/ghtk/useCalculateGHTKFee.ts

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios'; // Đảm bảo đường dẫn đến instance axios của bạn là chính xác
// ⭐ Thay đổi import: Thay vì GHTKShipFeeResponse, chúng ta sẽ sử dụng GHTKRawFeeResponse
import { CalculateFeeDto, GHTKRawFeeResponse } from '@/types/ghtk.type';

/**
 * @function useCalculateGHTKFee
 * @description Custom hook để gửi yêu cầu tính phí vận chuyển GHTK thông qua API backend.
 * Sử dụng `useMutation` để quản lý trạng thái pending, success, error.
 */
export const useCalculateGHTKFee = () => {
  // ⭐ THAY ĐỔI KIỂU DỮ LIỆU ĐẦU TIÊN TỪ GHTKShipFeeResponse SANG GHTKRawFeeResponse ⭐
  // Hook này bây giờ sẽ trả về cấu trúc raw từ GHTK mà backend đang chuyển tiếp.
  return useMutation<GHTKRawFeeResponse, Error, CalculateFeeDto>({
    /**
     * mutationFn: Hàm bất đồng bộ thực hiện cuộc gọi API.
     * @param data Dữ liệu đầu vào (CalculateFeeDto) để tính phí.
     * @returns Promise<GHTKRawFeeResponse> Phản hồi từ API backend.
     */
    mutationFn: async (data: CalculateFeeDto) => {
      // Endpoint API của bạn để tính phí.
      // Giả sử backend của bạn có một endpoint POST tại '/ghtk/calculate-fee'
      // axios.post sẽ tự động kiểu hóa res.data là GHTKRawFeeResponse
      const res = await api.post<GHTKRawFeeResponse>('/ghtk/calculate-fee', data);
      return res.data;
    },
    /**
     * onSuccess: Callback được gọi khi cuộc gọi API thành công.
     * @param response Phản hồi thành công từ API, có kiểu GHTKRawFeeResponse.
     */
    onSuccess: (response) => {
      // ⭐ CẬP NHẬT LOGIC TRUY CẬP PHÍ VÀ MESSAGE THEO CẤU TRÚC GHTKRawFeeResponse ⭐
      if (response.success && response.fee?.success && response.fee?.fee) {
        console.log('GHTK Fee calculated successfully:', response.fee.fee.fee); // Truy cập phí ở cấp độ sâu nhất
      } else {
        // Ưu tiên hiển thị message từ cấp độ sâu hơn nếu có, sau đó đến message cấp 1, cuối cùng là message cấp cao nhất
        console.warn('GHTK Fee calculation failed:', response.fee?.message || response.message || response.reason || 'Unknown reason');
      }
    },
    /**
     * onError: Callback được gọi khi cuộc gọi API thất bại.
     * @param error Đối tượng lỗi.
     */
    onError: (error: any) => {
      console.error('Error calculating GHTK fee:', error.message || 'Unknown error');
      // message.error('Có lỗi xảy ra khi tính phí vận chuyển!'); // Có thể hiển thị thông báo lỗi Ant Design
    },
  });
};