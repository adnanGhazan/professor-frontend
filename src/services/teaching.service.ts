import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  TeachingCourse,
  TeachingListResponse,
  TeachingParams,
} from "../types/teaching";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const TeachingService = {
  /**
   * Fetch visible teaching courses for public pages (GET /api/v1/teachings)
   */
  async getPublicTeachings(): Promise<TeachingCourse[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/teachings`;

    try {
      const response = await fetcher<
        | ApiResponse<TeachingListResponse>
        | TeachingListResponse
        | TeachingCourse[]
      >(url);

      let items: TeachingCourse[] = [];

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
          Array.isArray((data as TeachingListResponse).items)
        ) {
          items = (data as TeachingListResponse).items;
        }
      } else if (
        response &&
        typeof response === "object" &&
        "items" in response &&
        Array.isArray((response as TeachingListResponse).items)
      ) {
        items = (response as TeachingListResponse).items;
      }

      return items
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } catch (error) {
      console.error("TeachingService.getPublicTeachings error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated teaching courses for Admin Management (GET /api/v1/teachings)
   */
  async getAdminTeachings(
    params?: TeachingParams
  ): Promise<TeachingListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.level) query.set("level", params.level);
    if (params?.status) query.set("status", params.status);
    if (params?.is_visible !== undefined && params.is_visible !== "") {
      query.set("is_visible", String(params.is_visible));
    }
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/teachings?${query.toString()}`;
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
        errorData.message || `Failed to fetch teaching courses (${response.status})`
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
   * Fetch single teaching record (GET /api/v1/teachings/{id})
   */
  async getTeachingById(id: string | number): Promise<TeachingCourse> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/teachings/${id}`;
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
        errorData.message || `Failed to fetch teaching record (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new teaching record (POST /api/v1/teachings)
   */
  async createTeaching(
    data: FormData | Partial<TeachingCourse>
  ): Promise<TeachingCourse> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/teachings`;
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
        `Failed to create teaching record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing teaching record (PUT /api/v1/teachings/{id})
   */
  async updateTeaching(
    id: string | number,
    data: FormData | Partial<TeachingCourse>
  ): Promise<TeachingCourse> {
    const isFormData = data instanceof FormData;
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/teachings/${id}`;
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
        `Failed to update teaching record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a teaching record (DELETE /api/v1/teachings/{id})
   */
  async deleteTeaching(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/teachings/${id}`;
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
        `Failed to delete teaching record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
