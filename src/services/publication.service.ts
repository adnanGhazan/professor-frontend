import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  Publication,
  PublicationListResponse,
  PublicationParams,
} from "../types/publication";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const PublicationService = {
  /**
   * Fetch visible publications for public pages (GET /api/v1/publications)
   */
  async getPublicPublications(): Promise<Publication[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/publications`;

    try {
      const response = await fetcher<
        | ApiResponse<PublicationListResponse>
        | PublicationListResponse
        | Publication[]
      >(url);

      let items: Publication[] = [];

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
          Array.isArray((data as PublicationListResponse).items)
        ) {
          items = (data as PublicationListResponse).items;
        }
      } else if (
        response &&
        typeof response === "object" &&
        "items" in response &&
        Array.isArray((response as PublicationListResponse).items)
      ) {
        items = (response as PublicationListResponse).items;
      }

      return items
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => {
          // 1. Prioritize featured publications first
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;

          // 2. Sort by publication_year descending
          const yearA = a.publication_year ? Number(a.publication_year) : 0;
          const yearB = b.publication_year ? Number(b.publication_year) : 0;
          return yearB - yearA;
        });
    } catch (error) {
      console.error("PublicationService.getPublicPublications error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated publications for Admin Management (GET /api/v1/publications)
   */
  async getAdminPublications(
    params?: PublicationParams
  ): Promise<PublicationListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.publication_type) query.set("publication_type", params.publication_type);
    if (params?.publication_year !== undefined && params.publication_year !== "") {
      query.set("publication_year", String(params.publication_year));
    }
    if (params?.research_area_id !== undefined && params.research_area_id !== "") {
      query.set("research_area_id", String(params.research_area_id));
    }
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

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/publications?${query.toString()}`;
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
        errorData.message || `Failed to fetch publications (${response.status})`
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
   * Fetch single publication details (GET /api/v1/publications/{id})
   */
  async getPublicationById(id: string | number): Promise<Publication> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/publications/${id}`;
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
        errorData.message || `Failed to fetch publication (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new publication (POST /api/v1/publications)
   * Supports FormData for PDF upload or JSON payload
   */
  async createPublication(
    data: FormData | Partial<Publication>
  ): Promise<Publication> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/publications`;
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
        `Failed to create publication (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing publication (PUT /api/v1/publications/{id} for JSON, POST /api/v1/publications/{id} for FormData)
   */
  async updatePublication(
    id: string | number,
    data: FormData | Partial<Publication>
  ): Promise<Publication> {
    const isFormData = data instanceof FormData;
    // For multipart update support, use POST to /api/v1/publications/{id}
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/publications/${id}`;
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
        `Failed to update publication (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a publication (DELETE /api/v1/publications/{id})
   */
  async deletePublication(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/publications/${id}`;
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
        `Failed to delete publication (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
