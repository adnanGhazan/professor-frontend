/**
 * Document Data Types & Interfaces
 */

export interface DocumentRecord {
  id: number | string;
  title: string;
  description: string | null;
  file: string | null;
  file_url: string | null;
  file_name: string | null;
  file_extension: string | null;
  document_type: string;
  published_at: string | null;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface DocumentListResponse {
  items: DocumentRecord[];
  pagination: DocumentPagination;
}

export interface DocumentParams {
  search?: string;
  document_type?: string;
  is_visible?: boolean | string;
  sort_by?: "published_at" | "title" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
