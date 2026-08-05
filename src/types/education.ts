/**
 * Education Entity & API Types
 */

export interface Education {
  id: string | number;
  degree: string;
  field?: string | null;
  institution: string;
  location?: string | null;
  start_year?: number | string | null;
  end_year?: number | string | null;
  passing_year?: string | number | null;
  year_range?: string | null;
  grade_or_gpa?: string | null;
  thesis_title?: string | null;
  advisor?: string | null;
  honors?: string[] | string | null;
  description?: string | null;
  sort_order?: number | null;
  is_visible?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EducationPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface EducationListResponse {
  items: Education[];
  pagination: EducationPagination;
}
