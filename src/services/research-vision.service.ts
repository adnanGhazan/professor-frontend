import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { ResearchVision, ResearchMethodology } from "../types/research-vision";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const ResearchVisionService = {
  /**
   * Fetch main Research Vision record for public About page (GET /api/v1/research-vision)
   */
  async getPublicResearchVision(): Promise<ResearchVision | null> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-vision`;
    try {
      const response = await fetcher<ApiResponse<ResearchVision> | ResearchVision>(url);
      let vision: ResearchVision | null = null;
      if (response && "data" in response) {
        vision = (response as ApiResponse<ResearchVision>).data;
      } else if (response && typeof response === "object") {
        vision = response as ResearchVision;
      }
      return vision;
    } catch (error) {
      console.error("ResearchVisionService.getPublicResearchVision error:", error);
      return null;
    }
  },

  /**
   * Fetch public methodologies list (GET /api/v1/research-methodologies)
   */
  async getPublicMethodologies(): Promise<ResearchMethodology[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-methodologies`;
    try {
      const response = await fetcher<ApiResponse<ResearchMethodology[]> | ResearchMethodology[]>(url);
      let items: ResearchMethodology[] = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && "data" in response && Array.isArray(response.data)) {
        items = response.data;
      }
      return items
        .filter((m) => m.is_visible !== false)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    } catch (error) {
      console.error("ResearchVisionService.getPublicMethodologies error:", error);
      return [];
    }
  },
  /**
   * Fetch main Research Vision record (with methodologies) for admin management
   */
  async getAdminResearchVision(): Promise<ResearchVision | null> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-vision?all=1`;
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
      throw new Error(errorData.message || `Failed to fetch research vision (${response.status})`);
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Update main Research Vision record
   */
  async updateResearchVision(data: Partial<ResearchVision>): Promise<ResearchVision> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-vision`;
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
      const errorMsg = resJson.message || `Failed to update research vision (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Fetch methodologies list for admin
   */
  async getAdminMethodologies(visionId?: number): Promise<ResearchMethodology[]> {
    const query = new URLSearchParams();
    query.set("all", "1");
    if (visionId) {
      query.set("research_vision_id", String(visionId));
    }

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-methodologies?${query.toString()}`;
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
      throw new Error(errorData.message || `Failed to fetch methodologies (${response.status})`);
    }

    const json = await response.json();
    const dataPayload = json.data || json;
    return Array.isArray(dataPayload) ? dataPayload : dataPayload.items || [];
  },

  /**
   * Create a new Research Methodology card
   */
  async createMethodology(data: Partial<ResearchMethodology>): Promise<ResearchMethodology> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-methodologies`;
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
      const errorMsg = resJson.message || `Failed to create methodology (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing Research Methodology card
   */
  async updateMethodology(
    id: number | string,
    data: Partial<ResearchMethodology>
  ): Promise<ResearchMethodology> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-methodologies/${id}`;
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
      const errorMsg = resJson.message || `Failed to update methodology (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a Research Methodology card
   */
  async deleteMethodology(id: number | string): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-methodologies/${id}`;
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
      const errorMsg = resJson.message || `Failed to delete methodology (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
