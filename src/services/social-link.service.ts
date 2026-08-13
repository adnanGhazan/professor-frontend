import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  SocialLink,
  SocialLinkListResponse,
  SocialLinkParams,
} from "../types/social-link";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const SocialLinkService = {
  /**
   * Fetch visible social links for public pages (GET /api/v1/social-links)
   */
  async getPublicSocialLinks(): Promise<SocialLink[]> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/social-links`;

    try {
      const response = await fetcher<any>(url);

      let items: SocialLink[] = [];

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
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (error) {
      console.error("SocialLinkService.getPublicSocialLinks error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated social link records for Admin Management (GET /api/v1/social-links)
   */
  async getAdminSocialLinks(
    params?: SocialLinkParams
  ): Promise<SocialLinkListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.platform) query.set("platform", params.platform);
    if (params?.is_visible !== undefined && params.is_visible !== "") {
      query.set("is_visible", String(params.is_visible));
    }
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/social-links?${query.toString()}`;
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
        errorData.message || `Failed to fetch social links (${response.status})`
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
   * Fetch single social link record (GET /api/v1/social-links/{id})
   */
  async getSocialLinkById(id: string | number): Promise<SocialLink> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/social-links/${id}`;
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
        errorData.message || `Failed to fetch social link (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new social link record (POST /api/v1/social-links)
   */
  async createSocialLink(data: Partial<SocialLink>): Promise<SocialLink> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/social-links`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError(
        "Authentication token missing. Please log in again."
      );
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
      const errorMsg =
        resJson.message ||
        `Failed to create social link (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing social link record (PUT /api/v1/social-links/{id})
   */
  async updateSocialLink(
    id: string | number,
    data: Partial<SocialLink>
  ): Promise<SocialLink> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/social-links/${id}`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError(
        "Authentication token missing. Please log in again."
      );
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
      const errorMsg =
        resJson.message ||
        `Failed to update social link (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a social link record (DELETE /api/v1/social-links/{id})
   */
  async deleteSocialLink(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/social-links/${id}`;
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
        `Failed to delete social link (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
