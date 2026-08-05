import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { Experience, ExperienceListResponse } from "../types/experience";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const ExperienceService = {
  /**
   * Fetch all visible experience records for public view (GET /api/v1/experiences)
   */
  async getExperiences(): Promise<Experience[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/experiences`;

    try {
      const response = await fetcher<
        ApiResponse<Experience[] | { items: Experience[] }> | Experience[] | { items: Experience[] }
      >(url);

      if (Array.isArray(response)) {
        return response;
      }

      if (response && "data" in response) {
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: Experience[] }).items)) {
          return (data as { items: Experience[] }).items;
        }
      }

      if (response && typeof response === "object" && "items" in response && Array.isArray((response as { items: Experience[] }).items)) {
        return (response as { items: Experience[] }).items;
      }

      return [];
    } catch (error) {
      console.error("ExperienceService.getExperiences error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated experience records for Admin Management (GET /api/v1/experiences?all=1)
   */
  async getAdminExperiences(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ExperienceListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/experiences?${query.toString()}`;
    const token = AuthService.getToken();

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to fetch experience records (${response.status})`);
    }

    const json = await response.json();
    const dataPayload = json.data || json;

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
   * Create a new experience record (POST /api/v1/experiences)
   */
  async createExperience(data: Partial<Experience>): Promise<Experience> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/experiences`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError("Authentication token missing. Please log in again.");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resJson = await response.json().catch(() => ({
      message: response.statusText || "Server error occurred",
    }));

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to create experience record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing experience record (PUT /api/v1/experiences/{id})
   */
  async updateExperience(id: string | number, data: Partial<Experience>): Promise<Experience> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/experiences/${id}`;
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
      body: JSON.stringify(data),
    });

    const resJson = await response.json().catch(() => ({
      message: response.statusText || "Server error occurred",
    }));

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to update experience record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete an experience record (DELETE /api/v1/experiences/{id})
   */
  async deleteExperience(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/experiences/${id}`;
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

    const resJson = await response.json().catch(() => ({}));

    if (response.status === 401) {
      AuthService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiValidationError("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorMsg = resJson.message || `Failed to delete experience record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
