export interface SkillItem {
  id: number;
  skill_category_id: number;
  title: string;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SkillCategory {
  id: number;
  title: string;
  display_order: number;
  is_visible: boolean;
  skill_items?: SkillItem[];
  created_at?: string;
  updated_at?: string;
}
