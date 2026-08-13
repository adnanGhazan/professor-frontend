/**
 * Video Data Types & Interfaces
 */

export interface VideoRecord {
  id: number | string;
  title: string;
  slug: string | null;
  description: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  embed_url: string | null;
  thumbnail: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VideoPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface VideoListResponse {
  items: VideoRecord[];
  pagination: VideoPagination;
}

export interface VideoParams {
  search?: string;
  is_featured?: boolean | string;
  is_visible?: boolean | string;
  sort_by?: "published_at" | "title" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
