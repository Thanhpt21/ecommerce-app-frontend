import { OrderItem } from "./order-item.type";
import { ShippingAddress } from "../shipping-address.type";
import { User } from "../user.type";
import { OrderStatus, PaymentMethod } from "../../enums/order.enums";
import { Shipping } from "../shipping.type";

export interface Order {
  id: number;
  userId: number;
  shippingAddressId: number;
  couponId?: number | null;
  shippingId?: number | null;
  shippingFee?: number | null;

  user: User;
  shippingAddress: ShippingAddress;
  coupon?: Coupon | null;
  shipping?: Shipping | null;
  items: OrderItem[];

  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  paymentMethod: string;
  note?: string | null;

  totalAmount: number;
  discountAmount: number;
  finalAmount: number;

  cancelReason?: string | null;

  createdAt: string; // Hoặc Date nếu bạn muốn làm việc với đối tượng Date
  updatedAt: string; // Hoặc Date
}


export interface UpdateOrderDto {
  status: OrderStatus;
}

export interface CancelOrderDto {
  reason: string;
}


// Giả định các kiểu dữ liệu cho DTO từ backend
export interface OrderItemDto {
  productId?: number;
  variantId?: number;
  sizeId?: number;  
  colorId?: number; 
  quantity: number;
}

export interface CreateOrderDto {
  status?: string; // Tùy chọn, backend có thể mặc định là 'pending'
  paymentMethod?: string;
  shippingAddressId: number;
  shippingId?: number;
  shippingFee?: number;
  note?: string;
  couponId?: number;
  items: OrderItemDto[];
}
