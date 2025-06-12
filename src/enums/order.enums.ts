// src/types/order/enums.ts

export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipping = 'shipping',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum PaymentMethod {
  COD = 'COD',
  Bank = 'Bank',
  Momo = 'Momo',
}