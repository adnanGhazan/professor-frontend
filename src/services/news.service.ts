import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  NewsArticle,
  NewsListResponse,
  NewsParams,
} from "../types/news";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const NewsService = {
  /**
   * Fetch published news for public pages (GET /api/v1/news)
   */
  async getPublicNews(): Promise<NewsArticle[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/news`;

    try {
      const response = await fetcher<
        | ApiResponse<NewsListResponse>
        | NewsListResponse
        | NewsArticle[]
      >(url);

      let items: NewsArticle[] = [];

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
          Array.isArray((data as NewsListResponse).items)
        ) {
          items = (data as NewsListResponse).items;
        }
      } else if (
        response &&
        typeof response === "object" &&
        "items" in response &&
        Array.isArray((response as NewsListResponse).items)
      ) {
        items = (response as NewsListResponse).items;
      }

      return items
        .filter((item) => item.status === "published" || !item.status)
        .sort((a, b) => {
          // 1. Featured articles first
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;

          // 2. Primary sort: published_at descending, fallback to created_at descending
          const dateA = a.published_at
            ? new Date(a.published_at).getTime()
            : a.created_at
            ? new Date(a.created_at).getTime()
            : 0;
          const dateB = b.published_at
            ? new Date(b.published_at).getTime()
            : b.created_at
            ? new Date(b.created_at).getTime()
            : 0;

          return dateB - dateA;
        });
    } catch (error) {
      console.error("NewsService.getPublicNews error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated news articles for Admin Management (GET /api/v1/news)
   */
  async getAdminNews(
    params?: NewsParams
  ): Promise<NewsListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.is_featured !== undefined && params.is_featured !== "") {
      query.set("is_featured", String(params.is_featured));
    }
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/news?${query.toString()}`;
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
        errorData.message || `Failed to fetch news articles (${response.status})`
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
   * Fetch single news record (GET /api/v1/news/{id})
   */
  async getNewsById(id: string | number): Promise<NewsArticle> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/news/${id}`;
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
        errorData.message || `Failed to fetch news record (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new news record (POST /api/v1/news)
   * Supports FormData for featured_image upload or JSON payload
   */
  async createNews(
    data: FormData | Partial<NewsArticle>
  ): Promise<NewsArticle> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/news`;
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
        `Failed to create news record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing news record (PUT /api/v1/news/{id} for JSON, POST /api/v1/news/{id} for FormData)
   */
  async updateNews(
    id: string | number,
    data: FormData | Partial<NewsArticle>
  ): Promise<NewsArticle> {
    const isFormData = data instanceof FormData;
    // For multipart update support, use POST to /api/v1/news/{id}
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/news/${id}`;
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
        `Failed to update news record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a news record (DELETE /api/v1/news/{id})
   */
  async deleteNews(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/news/${id}`;
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
        `Failed to delete news record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
