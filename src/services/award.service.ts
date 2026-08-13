import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  Award,
  AwardListResponse,
  AwardParams,
} from "../types/award";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

const getApiBaseUrl = (): string => {
  const url = (
    process.env.NEXT_PUBLIC_API_URL ||
    env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000/api/v1"
  )
    .trim()
    .replace(/\/+$/, "");
  return url.replace(/\/api\/v1\/api\/v1$/i, "/api/v1");
};

function extractListItems<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === "object") {
    if (response.data) {
      if (Array.isArray(response.data)) return response.data;
      if (typeof response.data === "object") {
        if (Array.isArray(response.data.items)) return response.data.items;
        if (Array.isArray(response.data.data)) return response.data.data;
      }
    }
    if (Array.isArray(response.items)) return response.items;
  }
  return [];
}

export const AwardService = {
  /**
   * Fetch visible awards for public pages (GET /awards)
   */
  async getPublicAwards(): Promise<Award[]> {
    const url = `${getApiBaseUrl()}/awards`;

    try {
      const response = await fetcher<any>(url);
      const items: Award[] = extractListItems<Award>(response);

      return items
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => {
          // 1. Featured awards first
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;

          // 2. Primary sort: sort_order ascending
          const orderA = a.sort_order ?? 0;
          const orderB = b.sort_order ?? 0;
          if (orderA !== orderB) {
            return orderA - orderB;
          }

          // 3. Secondary sort: award_date descending
          const dateA = a.award_date ? new Date(a.award_date).getTime() : 0;
          const dateB = b.award_date ? new Date(b.award_date).getTime() : 0;
          return dateB - dateA;
        });
    } catch (error) {
      console.error("AwardService.getPublicAwards error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated award records for Admin Management (GET /awards)
   */
  async getAdminAwards(
    params?: AwardParams
  ): Promise<AwardListResponse> {
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

    const url = `${getApiBaseUrl()}/awards?${query.toString()}`;
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
        errorData.message || `Failed to fetch award records (${response.status})`
      );
    }

    const json = await response.json();
    const items = extractListItems<Award>(json);

    return {
      items,
      pagination: json.data?.pagination || json.pagination || {
        total: items.length,
        count: items.length,
        per_page: 15,
        current_page: 1,
        total_pages: 1,
      },
    };
  },

  /**
   * Fetch single award record (GET /awards/{id})
   */
  async getAwardById(id: string | number): Promise<Award> {
    const url = `${getApiBaseUrl()}/awards/${id}`;
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
        errorData.message || `Failed to fetch award record (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new award record (POST /awards)
   * Supports FormData for image upload or JSON payload
   */
  async createAward(
    data: FormData | Partial<Award>
  ): Promise<Award> {
    const url = `${getApiBaseUrl()}/awards`;
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
        `Failed to create award record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing award record (PUT /awards/{id} for JSON, POST /awards/{id} for FormData)
   */
  async updateAward(
    id: string | number,
    data: FormData | Partial<Award>
  ): Promise<Award> {
    const isFormData = data instanceof FormData;
    const url = `${getApiBaseUrl()}/awards/${id}`;
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
        `Failed to update award record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete an award record (DELETE /awards/{id})
   */
  async deleteAward(id: string | number): Promise<void> {
    const url = `${getApiBaseUrl()}/awards/${id}`;
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
        `Failed to delete award record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
