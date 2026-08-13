/**
 * News Article Data Types & Interfaces
 */

export interface NewsArticle {
  id: number | string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  image_url: string | null;
  status: "published" | "draft" | string;
  published_at: string | null;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NewsPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface NewsListResponse {
  items: NewsArticle[];
  pagination: NewsPagination;
}

export interface NewsParams {
  search?: string;
  status?: string;
  is_featured?: boolean | string;
  sort_by?: "published_at" | "created_at" | "title" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
