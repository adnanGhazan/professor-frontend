import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  ResearchArea,
  ResearchAreaListResponse,
  ResearchAreaParams,
} from "../types/research-area";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const ResearchAreaService = {
  /**
   * Fetch visible research areas for public pages (GET /api/v1/research-areas)
   */
  async getPublicResearchAreas(): Promise<ResearchArea[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-areas?sort_by=sort_order&sort_dir=asc`;

    try {
      const response = await fetcher<
        | ApiResponse<ResearchAreaListResponse>
        | ResearchAreaListResponse
        | ResearchArea[]
      >(url);

      let items: ResearchArea[] = [];

      if (Array.isArray(response)) {
        items = response;
      } else if (response && "data" in response) {
        const data = response.data;
        if (Array.isArray(data)) {
          items = data;
        } else if (
          data &&
          typeof data === "object" &&
          "items" in data &&
          Array.isArray((data as ResearchAreaListResponse).items)
        ) {
          items = (data as ResearchAreaListResponse).items;
        }
      } else if (
        response &&
        typeof response === "object" &&
        "items" in response &&
        Array.isArray((response as ResearchAreaListResponse).items)
      ) {
        items = (response as ResearchAreaListResponse).items;
      }

      // Filter visible items and sort by sort_order ascending
      return items
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (error) {
      console.error("ResearchAreaService.getPublicResearchAreas error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated research areas for Admin Management (GET /api/v1/research-areas)
   */
  async getAdminResearchAreas(
    params?: ResearchAreaParams
  ): Promise<ResearchAreaListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.is_featured !== undefined && params.is_featured !== "") {
      query.set("is_featured", String(params.is_featured));
    }
    if (params?.is_visible !== undefined && params.is_visible !== "") {
      query.set("is_visible", String(params.is_visible));
    }
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-areas?${query.toString()}`;
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
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `Failed to fetch research areas (${response.status})`
      );
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
   * Fetch single research area details (GET /api/v1/research-areas/{id})
   */
  async getResearchAreaById(id: string | number): Promise<ResearchArea> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-areas/${id}`;
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
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `Failed to fetch research area (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new research area (POST /api/v1/research-areas)
   * Supports FormData for image upload or JSON payload
   */
  async createResearchArea(
    data: FormData | Partial<ResearchArea>
  ): Promise<ResearchArea> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-areas`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError(
        "Authentication token missing. Please log in again."
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    let body: BodyInit;
    if (data instanceof FormData) {
      // DO NOT set Content-Type header manually for FormData
      body = data;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
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
      const errorMsg =
        resJson.message ||
        `Failed to create research area (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing research area (PUT /api/v1/research-areas/{id} for JSON, POST /api/v1/research-areas/{id} for FormData)
   */
  async updateResearchArea(
    id: string | number,
    data: FormData | Partial<ResearchArea>
  ): Promise<ResearchArea> {
    const isFormData = data instanceof FormData;
    // For multipart update support, use POST to /api/v1/research-areas/{id}
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-areas/${id}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError(
        "Authentication token missing. Please log in again."
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    let body: BodyInit;
    const method = isFormData ? "POST" : "PUT";

    if (isFormData) {
      // DO NOT set Content-Type header manually for FormData
      body = data;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
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
      const errorMsg =
        resJson.message ||
        `Failed to update research area (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a research area (DELETE /api/v1/research-areas/{id})
   */
  async deleteResearchArea(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/research-areas/${id}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError(
        "Authentication token missing. Please log in again."
      );
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
      const errorMsg =
        resJson.message ||
        `Failed to delete research area (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
