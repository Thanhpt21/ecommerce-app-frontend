// hooks/auth/useLogout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { logout as apiLogout } from '@/lib/auth/logout'; // Giả định đây là hàm logout API của bạn
import { useRouter } from 'next/navigation';
import { useLocaleContext } from '@/context/LocaleContext';

export const useLogout = () => {
  const queryClient = useQueryClient(); // Khởi tạo queryClient
  const router = useRouter();
  const { locale } = useLocaleContext();

  const { mutate: logoutUser, isPending } = useMutation({
    mutationFn: async () => {
      // Gọi hàm logout thực tế, giả định nó xóa token hoặc session
      await apiLogout(); 
      // apiLogout của bạn nên xóa token từ localStorage hoặc cookies
      // Ví dụ: localStorage.removeItem('accessToken');
    },
    onSuccess: () => {
      // 1. RẤT QUAN TRỌNG: Xóa và làm mất hiệu lực cache của 'current-user'
      // Điều này buộc `useCurrent` phải refetch hoặc trả về `undefined`
      queryClient.removeQueries({ queryKey: ['current-user'] }); // Xóa hoàn toàn dữ liệu cũ
      queryClient.invalidateQueries({ queryKey: ['current-user'] }); // Đảm bảo trạng thái bị đánh dấu là "cũ"

      // 2. Chuyển hướng người dùng về trang đăng nhập
      router.push(locale === 'vi' || !locale ? '/vi/login' : '/en/login');
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Xử lý lỗi nếu có
    },
  });

  return { logoutUser, isPending };
};