export interface CreateMeetingRequestPayload {
  full_name: string;
  affiliation?: string;
  email: string;
  country: string;
  phone?: string;
  meeting_purpose: string;
  preferred_date: string;
  duration: number; // 30 or 60
  discussion_points?: string;
}

export interface MeetingRequest {
  id: number;
  full_name: string;
  affiliation?: string | null;
  email: string;
  country: string;
  phone?: string | null;
  meeting_purpose: string;
  preferred_date: string;
  duration: number;
  discussion_points?: string | null;
  status: "pending" | "approved" | "rejected" | string;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MeetingRequestParams {
  search?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface MeetingRequestPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface MeetingRequestListResponse {
  items: MeetingRequest[];
  pagination: MeetingRequestPagination;
}
