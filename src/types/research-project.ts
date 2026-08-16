import { ResearchArea } from "./research-area";

/**
 * Research Project Data Types & Interfaces
 */

export interface ResearchProject {
  id: number | string;
  research_area_id: number | string | null;
  research_area?: ResearchArea | null;
  title: string;
  slug: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  project_type?: string | null;
  funding_source: string | null;
  project_url: string | null;
  image: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResearchProjectPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface ResearchProjectListResponse {
  items: ResearchProject[];
  pagination: ResearchProjectPagination;
}

export interface ResearchProjectParams {
  search?: string;
  research_area_id?: number | string;
  status?: string;
  is_featured?: boolean | string;
  is_visible?: boolean | string;
  sort_by?: "title" | "start_date" | "end_date" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
