// src/types/variant.type.ts

export interface Variant {
  id: number;
  title?: string; // Thêm title
  price: number;
  discount?: number;
  thumb: string;
  images: string[];
  sku: string; // Thêm sku
  createdAt?: string; // Thêm createdAt
  updatedAt?: string; // Thêm updatedAt
  productId?: number; // Thêm productId
  colorId?: number;
  color?: {
    id: number;
    title: string;
    code: string;
  };
  sizes?: {
    id: number;
    title: string;
  }[];
  quantity?: number;
}


export interface VariantCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
  productId?: string;
  colors: { id: number; title: string; code: string }[];
  sizes: { id: number; title: string }[];
}

export interface VariantUpdateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
  variant: Variant | null;
  productId?: string;
  colors: { id: number; title: string; code: string }[];
  sizes: { id: number; title: string }[];
}

// Bạn có thể cần định nghĩa thêm các types khác liên quan đến variant
// ví dụ như payload cho việc fetch, update, delete,...