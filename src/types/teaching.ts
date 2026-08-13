/**
 * Teaching & Course Data Types & Interfaces
 */

export interface TeachingCourse {
  id: number | string;
  course_name: string;
  title?: string;
  course_code: string | null;
  code?: string | null;
  level: string | null;
  semester: string | null;
  academic_year: string | null;
  year?: string | null;
  description: string | null;
  status: "current" | "previously_taught" | string;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeachingPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface TeachingListResponse {
  items: TeachingCourse[];
  pagination: TeachingPagination;
}

export interface TeachingParams {
  search?: string;
  level?: string;
  status?: string;
  is_visible?: boolean | string;
  sort_by?: "course_name" | "title" | "sort_order" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
