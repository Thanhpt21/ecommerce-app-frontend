// src/types/order-item.type.ts

import { Order } from './order.type';
import { Product } from '../product.type'; // Giả sử bạn có type Product
import { Variant } from '../variant.type'; // Giả sử bạn có type Variant
import { Size } from '../size.type'; // Giả sử bạn có type Size
import { Color } from '../color.type'; // Giả sử bạn có type Color

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number | null;
  variantId?: number | null;
  sizeId?: number | null;
  colorId?: number | null;

  quantity: number;
  price: number;
  discount: number;

  order: Order;
  product?: Product | null;
  variant?: Variant | null;
  size?: Size | null;
  color?: Color | null;
}