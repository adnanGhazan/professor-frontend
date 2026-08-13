import { ResearchArea } from "./research-area";

/**
 * Publication Data Types & Interfaces
 */

export interface Publication {
  id: number | string;
  title: string;
  slug: string;
  authors: string | null;
  publication_type: string;
  journal: string | null;
  publication_year: number | null;
  publication_date: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  abstract: string | null;
  pdf_file: string | null;
  pdf_url: string | null;
  external_url: string | null;
  citation_count: number;
  research_area_id: number | string | null;
  research_area?: ResearchArea | null;
  is_featured: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicationPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface PublicationListResponse {
  items: Publication[];
  pagination: PublicationPagination;
}

export interface PublicationParams {
  search?: string;
  publication_type?: string;
  publication_year?: number | string;
  research_area_id?: number | string;
  is_featured?: boolean | string;
  is_visible?: boolean | string;
  sort_by?: "title" | "publication_year" | "publication_date" | "citation_count" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
