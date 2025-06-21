export interface Config {
  id: number;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  googlemap?: string | null;
  facebook?: string | null;
  zalo?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  x?: string | null;
  linkedin?: string | null;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  pick_province?: string | null; // Có thể null
  pick_district?: string | null; // Có thể null
  pick_ward?: string | null;     // Có thể null
  pick_address?: string | null;  // Có thể null
  pick_tel?: string | null;      // Đã thêm, có thể null
  pick_name?: string | null;     // Đã thêm, có thể null
}