/**
 * Professor Profile Entity & API Types
 */

export interface ProfessorProfile {
  id?: string | number;
  name: string;
  title?: string | null;
  designation?: string | null;
  department?: string | null;
  university?: string | null;
  short_bio?: string | null;
  biography?: string | null;
  research_summary?: string | null;
  profile_photo?: string | null;
  profile_photo_url?: string | null;
  cv_file?: string | null;
  cv_file_url?: string | null;
  email?: string | null;
  phone?: string | null;
  office?: string | null;
  address?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type UserProfile = ProfessorProfile;

export interface UpdateProfilePayload {
  name?: string;
  title?: string;
  designation?: string;
  department?: string;
  university?: string;
  short_bio?: string;
  biography?: string;
  research_summary?: string;
  email?: string;
  phone?: string;
  office?: string;
  address?: string;
  website?: string;
}
