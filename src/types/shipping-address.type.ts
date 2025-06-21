// src/types/shipping-address.type.ts

import { User } from './user.type'; // Giả sử bạn có type User
import { Order } from './order/order.type'; // Giả sử bạn có type Order

export interface CreateShippingAddressPayload {
  fullName: string;
  phone: string;
  address: string;
  // ⭐ Cập nhật tên trường địa chỉ ⭐
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  // ⭐ Thêm các trường ID địa chỉ mới ⭐
  wardId?: number | null;
  districtId?: number | null;
  provinceId?: number | null;
  isDefault?: boolean;
}

export interface ShippingAddress {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  address: string;
  // ⭐ Cập nhật tên trường địa chỉ ⭐
  ward: string | null; // Có thể null nếu không có
  district: string | null; // Có thể null nếu không có
  province: string | null; // Có thể null nếu không có
  // ⭐ Thêm các trường ID địa chỉ mới ⭐
  wardId: number | null; // Có thể null
  districtId: number | null; // Có thể null
  provinceId: number | null; // Có thể null
  isDefault: boolean;

  createdAt: string; // Hoặc Date
  updatedAt: string; // Hoặc Date

  user?: User; // Quan hệ với User, có thể không include khi fetch
  orders?: Order[]; // Quan hệ với Order, có thể không include khi fetch
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ShippingAddress[]; // Thay đổi từ ShippingAddress[] sang ShippingAddress | ShippingAddress[] nếu API có thể trả về một đối tượng đơn lẻ
}

// ⭐ BỔ SUNG: UpdateShippingAddressPayload để phù hợp với hàm update ⭐
// Điều này rất hữu ích cho các hàm update ở frontend/backend
export interface UpdateShippingAddressPayload {
  id: number; // Cần ID của địa chỉ cần update
  data: Partial<Omit<ShippingAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}