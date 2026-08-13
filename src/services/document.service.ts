import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import {
  DocumentRecord,
  DocumentListResponse,
  DocumentParams,
} from "../types/document";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const DocumentService = {
  /**
   * Fetch visible documents for public pages (GET /api/v1/documents)
   */
  async getPublicDocuments(): Promise<DocumentRecord[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/documents`;

    try {
      const response = await fetcher<
        | ApiResponse<DocumentListResponse>
        | DocumentListResponse
        | DocumentRecord[]
      >(url);

      let items: DocumentRecord[] = [];

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
          Array.isArray((data as DocumentListResponse).items)
        ) {
          items = (data as DocumentListResponse).items;
        }
      } else if (
        response &&
        typeof response === "object" &&
        "items" in response &&
        Array.isArray((response as DocumentListResponse).items)
      ) {
        items = (response as DocumentListResponse).items;
      }

      return items
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => {
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
      console.error("DocumentService.getPublicDocuments error:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated document records for Admin Management (GET /api/v1/documents)
   */
  async getAdminDocuments(
    params?: DocumentParams
  ): Promise<DocumentListResponse> {
    const query = new URLSearchParams();
    query.set("all", "1");

    if (params?.search) query.set("search", params.search);
    if (params?.document_type) query.set("document_type", params.document_type);
    if (params?.is_visible !== undefined && params.is_visible !== "") {
      query.set("is_visible", String(params.is_visible));
    }
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.per_page) query.set("per_page", params.per_page.toString());

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/documents?${query.toString()}`;
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
        errorData.message || `Failed to fetch document records (${response.status})`
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
   * Fetch single document record (GET /api/v1/documents/{id})
   */
  async getDocumentById(id: string | number): Promise<DocumentRecord> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/documents/${id}`;
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
        errorData.message || `Failed to fetch document record (${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  /**
   * Create a new document record (POST /api/v1/documents)
   * Supports FormData for file upload or JSON payload
   */
  async createDocument(
    data: FormData | Partial<DocumentRecord>
  ): Promise<DocumentRecord> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/documents`;
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
        `Failed to create document record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing document record (PUT /api/v1/documents/{id} for JSON, POST /api/v1/documents/{id} for FormData)
   */
  async updateDocument(
    id: string | number,
    data: FormData | Partial<DocumentRecord>
  ): Promise<DocumentRecord> {
    const isFormData = data instanceof FormData;
    // For multipart update support, use POST to /api/v1/documents/{id}
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/documents/${id}`;
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
        `Failed to update document record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a document record (DELETE /api/v1/documents/{id})
   */
  async deleteDocument(id: string | number): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/documents/${id}`;
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
        `Failed to delete document record (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
