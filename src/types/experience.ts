/**
 * Experience Entity & API Types
 */

export interface Experience {
  id: string | number;
  position: string;
  institution: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  period?: string;
  type?: string;
  description?: string;
  responsibilities?: string[] | string;
  sort_order?: number;
  is_visible?: boolean;
  role?: string;
  organization?: string;
}
