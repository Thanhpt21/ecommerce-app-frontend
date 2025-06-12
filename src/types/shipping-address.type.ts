// src/types/shipping-address.type.ts

import { User } from './user.type'; // Giả sử bạn có type User
import { Order } from './order/order.type'; // Giả sử bạn có type Order

export interface CreateShippingAddressPayload {
  fullName: string;
  phone: string;
  address: string;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  isDefault?: boolean;
}

export interface ShippingAddress {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;

  createdAt: string; // Hoặc Date
  updatedAt: string; // Hoặc Date

  user?: User; // Quan hệ với User, có thể không include khi fetch
  orders?: Order[]; // Quan hệ với Order, có thể không include khi fetch
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ShippingAddress[];
}
