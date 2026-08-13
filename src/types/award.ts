/**
 * Award & Honor Data Types & Interfaces
 */

export interface Award {
  id: number | string;
  title: string;
  awarding_body: string | null;
  organization?: string | null;
  award_date: string | null;
  description: string | null;
  image: string | null;
  image_url: string | null;
  external_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AwardPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface AwardListResponse {
  items: Award[];
  pagination: AwardPagination;
}

export interface AwardParams {
  search?: string;
  is_featured?: boolean | string;
  is_visible?: boolean | string;
  sort_by?: "title" | "award_date" | "sort_order" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
