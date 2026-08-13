import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  Student,
  StudentListResponse,
  StudentParams,
} from "../types/student";
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

export const StudentService = {
  /**
   * Fetch visible students for public pages (GET /students)
   */
  async getPublicStudents(): Promise<Student[]> {
    const url = `${getApiBaseUrl()}/students`;

    try {
      const response = await fetcher<any>(url);
      const items: Student[] = extractListItems<Student>(response);

      return items.filter((item) => item.is_visible !== false);
    } catch (error) {
      console.error("StudentService.getPublicStudents error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated student records for Admin Management (GET /students)
   */
  async getAdminStudents(
    params?: StudentParams
  ): Promise<StudentListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.degree) query.set("degree", params.degree);
    if (params?.status) query.set("status", params.status);
    if (params?.is_visible !== undefined && params.is_visible !== "") {
      query.set("is_visible", String(params.is_visible));
    }
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${getApiBaseUrl()}/students?${query.toString()}`;
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
        errorData.message || `Failed to fetch student records (${response.status})`
      );
    }

    const json = await response.json();
    const items = extractListItems<Student>(json);

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
   * Fetch single student record (GET /students/{id})
   */
  async getStudentById(id: string | number): Promise<Student> {
    const url = `${getApiBaseUrl()}/students/${id}`;
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
        errorData.message || `Failed to fetch student record (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new student record (POST /students)
   * Supports FormData for photo upload or JSON payload
   */
  async createStudent(
    data: FormData | Partial<Student>
  ): Promise<Student> {
    const url = `${getApiBaseUrl()}/students`;
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
        `Failed to create student record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing student record (PUT /students/{id} for JSON, POST /students/{id} for FormData)
   */
  async updateStudent(
    id: string | number,
    data: FormData | Partial<Student>
  ): Promise<Student> {
    const isFormData = data instanceof FormData;
    const url = `${getApiBaseUrl()}/students/${id}`;
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
        `Failed to update student record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a student record (DELETE /students/{id})
   */
  async deleteStudent(id: string | number): Promise<void> {
    const url = `${getApiBaseUrl()}/students/${id}`;
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
        `Failed to delete student record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
