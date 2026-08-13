/**
 * Student / Supervision Data Types & Interfaces
 */

export interface Student {
  id: number | string;
  student_name: string;
  degree: string;
  research_title: string | null;
  institution: string | null;
  start_year: number | null;
  completion_year: number | null;
  status: "current" | "completed" | string;
  photo: string | null;
  photo_url: string | null;
  description: string | null;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface StudentListResponse {
  items: Student[];
  pagination: StudentPagination;
}

export interface StudentParams {
  search?: string;
  degree?: string;
  status?: string;
  is_visible?: boolean | string;
  sort_by?: "student_name" | "start_year" | "completion_year" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
