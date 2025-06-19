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
  color?: Color;
  sizes?: VariantSizeDetail[];
}

export interface Color {
  id: number;
  title: string;
  code: string;
  // ... other Color properties
}

export interface VariantSizeDetail {
    variantId: number; // ID của biến thể mà kích thước này thuộc về
    sizeId: number;    // ID của kích thước (ví dụ: ID của 'S', 'M', 'L')
    title: string;     // Tên của kích thước (ví dụ: 'S', 'M', 'L')
    quantity: number;  // Số lượng biến thể có kích thước này
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