export interface ResearchMethodology {
  id: number;
  research_vision_id: number;
  title: string;
  description?: string | null;
  footer_text?: string | null;
  icon_key?: string | null;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResearchVision {
  id: number;
  section_title?: string | null;
  section_subtitle?: string | null;
  summary?: string | null;
  badge_text?: string | null;
  is_visible: boolean;
  methodologies?: ResearchMethodology[];
  created_at?: string;
  updated_at?: string;
}
