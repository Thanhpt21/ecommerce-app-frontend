import { BlogCategory } from "./blog-category.type";


export interface ContentItem {
  title: string; 
  body: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumb: string;
  content: ContentItem[]; // Sử dụng ContentItem[] ở đây
  categoryId: number;
  numberViews: number;
  isPublished: boolean;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    title: string;
    slug: string;
    image: string;
  };
  createdBy: {
    id: number;
    name: string;
    profilePicture: string;
    role: string;
  };
  likes: any[]; // Bạn có thể định nghĩa kiểu cụ thể hơn nếu cần
  dislikes: any[]; // Bạn có thể định nghĩa kiểu cụ thể hơn nếu cần
  likesCount: number;
  dislikesCount: number;
  hasLiked: boolean;
  hasDisliked: boolean;
}

export interface BlogsByCategorySlugResponse {
  success: boolean;
  message: string;
  data: Blog[];
  total: number;
  page: number;
  pageCount: number;
  categoryInfo: BlogCategory | null; // Null if category not found
}