/**
 * Research Area Data Types & Interfaces
 */

export interface ResearchArea {
  id: number | string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image: string | null;
  image_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResearchAreaPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface ResearchAreaListResponse {
  items: ResearchArea[];
  pagination: ResearchAreaPagination;
}

export interface ResearchAreaApiResponse {
  success: boolean;
  message?: string;
  data: ResearchAreaListResponse;
}

export interface ResearchAreaParams {
  search?: string;
  is_featured?: boolean | string;
  is_visible?: boolean | string;
  sort_by?: "title" | "sort_order" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
