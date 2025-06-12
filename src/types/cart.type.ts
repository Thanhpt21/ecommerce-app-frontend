// src/types/cart.type.ts

export interface CartItem {
  id: string; // Đã đổi sang string để dùng ID tổng hợp (productId-colorId-sizeId-variantId)
  productId: number;
  variantId?: number;
  sizeId?: number;
  colorId?: number;

  thumb: string;
  title: string;
  price: number;
  discountedPrice?: number;
  selectedColor?: {
    id: string;
    title: string;
    code: string;
  };
  selectedSizeId?: string;
  selectedSizeTitle?: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  hydrate: () => void;
  addItem: (
    itemData: {
      productId: number;
      variantId?: number;
      thumb: string;
      title: string;
      price: number;
      discount?: number;
      quantity?: number;
      color?: { id: string; title: string; code: string };
      size?: { id: string; title: string };
    }
  ) => void;
  // Các hàm removeItem, increaseItemQuantity, decreaseItemQuantity đã được thay đổi để dùng `id: string`
  // (ID tổng hợp của CartItem) thay vì `itemId: string | number, selectedColorId?, selectedSizeId?`
  removeItem: (cartItemId: string) => void;
  increaseItemQuantity: (cartItemId: string) => void;
  decreaseItemQuantity: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}