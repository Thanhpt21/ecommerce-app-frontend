export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  code: string;
  thumb: string;
  price: number;
  discount: number;
  sold: number;
  status: string;
  averageRating: number;
  ratingCount: number;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  brandId?: number | null;
  brand?: Brand | null; // Assuming you have a Brand interface
  categoryId?: number | null;
  category?: Category | null; // Assuming you have a Category interface
  colorId?: number | null;
  color?: Color | null; // Assuming you have a Color interface
  size: ProductSize[]; // Assuming you have a ProductSize interface
  variants: Variant[]; // Assuming you have a Variant interface
  ratings: Rating[]; // Assuming you have a Rating interface
  OrderItem: OrderItem[]; // Assuming you have an OrderItem interface
}

// Assuming you have these interfaces as well:
export interface Brand {
  id: number;
  title: string;
  // ... other Brand properties
}

export interface Category {
  id: number;
  title: string;
  // ... other Category properties
}

export interface Color {
  id: number;
  title: string;
  code: string;
  // ... other Color properties
}


export interface ProductSize {
  productId: number;
  sizeId: number;
  // Có thể có thêm các thuộc tính khác nếu cần
}


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
}
export interface Rating {
  id: number;
  star: number;
  comment: string;
  createdAt: string;
  postedBy?: {    
    id: number;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
}
export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  // ... other OrderItem properties
}

export interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => void;
  colors: { id: string; title: string }[];
  categories: { id: string; title: string }[];
  brands: { id: string; title: string }[];
  sizes: { id: string; title: string }[];
}

export interface ProductUpdateModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  refetch: () => void;
  colors: { id: string; title: string }[];
  categories: { id: string; title: string }[];
  brands: { id: string; title: string }[];
  sizes: { id: string; title: string }[];
}

export interface ProductResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  code: string;
  thumb: string;
  price: number;
  discount: number;
  sold: number;
  status: string;
  averageRating: number;
  ratingCount: number;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  brand: { id: number; title: string };
  category: { id: number; title: string };
  color: { id: number; title: string; code: string };
  ratings: any[]; // Hoặc interface cụ thể
  sizes: { id: number; title: string }[];
  variants: {
    id: number;
    title: string;
    price: number;
    discount: number;
    thumb: string;
    images: string[];
    sku: string;
    createdAt: string;
    updatedAt: string;
    productId: number;
    colorId: number;
    sizes: { id: number; title: string }[];
    color: { id: number; title: string; code: string };
  }[];
}


// Cấu trúc phản hồi từ API /products/category/:categorySlug
export interface ProductsByCategorySlugResponse {
  success: boolean;
  message: string;
  data: Product[];
  total: number;
  page: number;
  pageCount: number;
  categoryInfo: Category | null; // Cần thêm trường này vào Category nếu chưa có
}


