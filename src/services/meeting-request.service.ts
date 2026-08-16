import { env } from "../lib/env";
import {
  CreateMeetingRequestPayload,
  MeetingRequest,
  MeetingRequestListResponse,
  MeetingRequestParams,
} from "../types/meeting-request";
import { AuthService, ApiValidationError } from "./auth.service";

export const MeetingRequestService = {
  /**
   * Submit a public meeting request (POST /api/v1/meeting-requests)
   */
  async createMeetingRequest(payload: CreateMeetingRequestPayload): Promise<MeetingRequest> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/meeting-requests`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json().catch(() => ({
        message: response.statusText || "Server error occurred",
      }));

      if (!response.ok) {
        const errorMsg =
          resJson.message || `Failed to submit meeting request (${response.status})`;
        throw new ApiValidationError(errorMsg, resJson.errors);
      }

      return resJson.data || resJson;
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      console.error("MeetingRequestService.createMeetingRequest error:", error);
      throw new ApiValidationError("Unable to submit meeting request. Please check server connection.");
    }
  },

  /**
   * Fetch paginated meeting requests for Admin (GET /api/v1/meeting-requests)
   */
  async getAdminMeetingRequests(params?: MeetingRequestParams): Promise<MeetingRequestListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const queryString = query.toString();
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/meeting-requests${queryString ? `?${queryString}` : ""}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError("Authentication token missing. Please log in again.");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    const resJson = await response.json().catch(() => ({
      message: response.statusText || "Server error occurred",
    }));

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to fetch meeting requests (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    const dataPayload = resJson.data || resJson;

    if (Array.isArray(dataPayload)) {
      return {
        items: dataPayload,
        pagination: {
          total: dataPayload.length,
          count: dataPayload.length,
          per_page: dataPayload.length || 15,
          current_page: 1,
          total_pages: 1,
        },
      };
    }

    return {
      items: dataPayload.items || [],
      pagination: dataPayload.pagination || {
        total: (dataPayload.items || []).length,
        count: (dataPayload.items || []).length,
        per_page: 15,
        current_page: 1,
        total_pages: 1,
      },
    };
  },

  /**
   * Get single meeting request by ID (GET /api/v1/meeting-requests/{id})
   */
  async getMeetingRequestById(id: number | string): Promise<MeetingRequest> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/meeting-requests/${id}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError("Authentication token missing. Please log in again.");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    const resJson = await response.json().catch(() => ({
      message: response.statusText || "Server error occurred",
    }));

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to fetch meeting request details (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update meeting request status / admin_notes (PUT /api/v1/meeting-requests/{id})
   */
  async updateMeetingRequest(
    id: number | string,
    payload: Partial<MeetingRequest>
  ): Promise<MeetingRequest> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/meeting-requests/${id}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError("Authentication token missing. Please log in again.");
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    const resJson = await response.json().catch(() => ({
      message: response.statusText || "Server error occurred",
    }));

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to update meeting request (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete meeting request record (DELETE /api/v1/meeting-requests/{id})
   */
  async deleteMeetingRequest(id: number | string): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/meeting-requests/${id}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError("Authentication token missing. Please log in again.");
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    const resJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to delete meeting request (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
