/**
 * Social Link Data Types & Interfaces
 */

export type SocialPlatform =
  | "YouTube"
  | "Facebook"
  | "LinkedIn"
  | "X"
  | "Instagram"
  | "ResearchGate"
  | "ORCID"
  | "Google Scholar"
  | "Scopus"
  | "GitHub"
  | "Website"
  | "Other"
  | string;

export interface SocialLink {
  id: number | string;
  platform: SocialPlatform;
  label: string | null;
  url: string;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SocialLinkPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface SocialLinkListResponse {
  items: SocialLink[];
  pagination: SocialLinkPagination;
}

export interface SocialLinkParams {
  search?: string;
  platform?: string;
  is_visible?: boolean | string;
  sort_by?: "sort_order" | "platform" | "created_at" | string;
  sort_dir?: "asc" | "desc" | string;
  page?: number;
  per_page?: number;
  all?: number | boolean;
}
