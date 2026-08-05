import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { Education, EducationListResponse } from "../types/education";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const EducationService = {
  /**
   * Fetch all visible education records for public view (GET /api/v1/educations)
   */
  async getEducations(): Promise<Education[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/educations`;

    try {
      const response = await fetcher<ApiResponse<Education[] | EducationListResponse> | Education[] | EducationListResponse>(url);

      if (Array.isArray(response)) {
        return response;
      }
      if (response && "data" in response) {
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === "object" && "items" in data && Array.isArray((data as EducationListResponse).items)) {
          return (data as EducationListResponse).items;
        }
      }
      if (response && typeof response === "object" && "items" in response && Array.isArray((response as EducationListResponse).items)) {
        return (response as EducationListResponse).items;
      }
      return [];
    } catch (error) {
      console.error("EducationService.getEducations error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated education records for Admin Management (GET /api/v1/educations?all=1)
   */
  async getAdminEducations(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<EducationListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/educations?${query.toString()}`;
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
      throw new Error(errorData.message || `Failed to fetch education records (${response.status})`);
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
   * Create a new education record (POST /api/v1/educations)
   */
  async createEducation(data: Partial<Education>): Promise<Education> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/educations`;
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
      const errorMsg = resJson.message || `Failed to create education record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing education record (PUT /api/v1/educations/{id})
   */
  async updateEducation(id: string | number, data: Partial<Education>): Promise<Education> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/educations/${id}`;
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
      const errorMsg = resJson.message || `Failed to update education record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete an education record (DELETE /api/v1/educations/{id})
   */
  async deleteEducation(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/educations/${id}`;
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
      const errorMsg = resJson.message || `Failed to delete education record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
