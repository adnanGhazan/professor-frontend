/**
 * Education Entity & API Types
 */

export interface Education {
  id: string | number;
  degree: string;
  field?: string;
  institution: string;
  passing_year?: string | number;
  start_year?: string | number;
  end_year?: string | number;
  year_range?: string;
  grade_or_gpa?: string;
  thesis_title?: string;
  advisor?: string;
  honors?: string[] | string;
  description?: string;
}
