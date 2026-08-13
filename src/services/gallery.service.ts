import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  GalleryItem,
  GalleryListResponse,
  GalleryParams,
} from "../types/gallery";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const GalleryService = {
  /**
   * Fetch visible gallery items for public pages (GET /api/v1/gallery)
   */
  async getPublicGallery(): Promise<GalleryItem[]> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/gallery`;

    try {
      const response = await fetcher<any>(url);

      let items: GalleryItem[] = [];

      if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response?.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        items = response.items;
      } else if (Array.isArray(response)) {
        items = response;
      }

      return items
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.sort_order !== b.sort_order) {
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
          }
          const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
          const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
          return dateB - dateA;
        });
    } catch (error) {
      console.error("GalleryService.getPublicGallery error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated gallery items for Admin Management (GET /api/v1/gallery)
   */
  async getAdminGallery(
    params?: GalleryParams
  ): Promise<GalleryListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
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

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/gallery?${query.toString()}`;
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
        errorData.message || `Failed to fetch gallery items (${response.status})`
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
   * Fetch single gallery item record (GET /api/v1/gallery/{id})
   */
  async getGalleryItemById(id: string | number): Promise<GalleryItem> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/gallery/${id}`;
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
        errorData.message || `Failed to fetch gallery item (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new gallery item record (POST /api/v1/gallery)
   * Supports FormData for image upload or JSON payload
   */
  async createGalleryItem(
    data: FormData | Partial<GalleryItem>
  ): Promise<GalleryItem> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/gallery`;
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
        `Failed to create gallery item (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing gallery item record (PUT /api/v1/gallery/{id} for JSON, POST /api/v1/gallery/{id} for FormData)
   */
  async updateGalleryItem(
    id: string | number,
    data: FormData | Partial<GalleryItem>
  ): Promise<GalleryItem> {
    const isFormData = data instanceof FormData;
    // For multipart update support, use POST to /api/v1/gallery/{id}
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/gallery/${id}`;
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
        `Failed to update gallery item (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a gallery item record (DELETE /api/v1/gallery/{id})
   */
  async deleteGalleryItem(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/gallery/${id}`;
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
        `Failed to delete gallery item (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
