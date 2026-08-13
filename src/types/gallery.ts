/**
 * Gallery Item Data Types & Interfaces
 */

export interface GalleryItem {
  id: number | string;
  title: string | null;
  description: string | null;
  image: string | null;
  image_url: string | null;
  category: string | null;
  event_date: string | null;
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface GalleryListResponse {
  items: GalleryItem[];
  pagination: GalleryPagination;
}

export interface GalleryParams {
  search?: string;
  category?: string;
  is_featured?: boolean | string;
  is_visible?: boolean | string;
  sort_by?: "event_date" | "sort_order" | "created_at" | "title" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
