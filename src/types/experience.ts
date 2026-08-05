/**
 * Experience Entity & API Types
 */

export interface Experience {
  id: string | number;
  position: string;
  institution: string;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  period?: string | null;
  type?: string | null;
  description?: string | null;
  responsibilities?: string[] | string | null;
  sort_order?: number | null;
  is_visible?: boolean;
  role?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExperiencePagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface ExperienceListResponse {
  items: Experience[];
  pagination: ExperiencePagination;
}
