import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { SkillCategory, SkillItem } from "../types/skill";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const SkillService = {
  /**
   * Fetch visible skill categories with items for public view (GET /api/v1/skill-categories)
   */
  async getPublicSkillCategories(): Promise<SkillCategory[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-categories`;
    try {
      const response = await fetcher<ApiResponse<SkillCategory[]> | SkillCategory[]>(url);
      let items: SkillCategory[] = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && "data" in response && Array.isArray(response.data)) {
        items = response.data;
      }
      return items
        .filter((c) => c.is_visible !== false)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((c) => ({
          ...c,
          skill_items: (c.skill_items || [])
            .filter((i) => i.is_visible !== false)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
        }));
    } catch (error) {
      console.error("SkillService.getPublicSkillCategories error:", error);
      return [];
    }
  },
  /**
   * Fetch all skill categories with skill items for admin management
   */
  async getAdminSkillCategories(): Promise<SkillCategory[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-categories?all=1`;
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
      throw new Error(errorData.message || `Failed to fetch skill categories (${response.status})`);
    }

    const json = await response.json();
    const dataPayload = json.data || json;
    return Array.isArray(dataPayload) ? dataPayload : dataPayload.items || [];
  },

  /**
   * Create a new Skill Category
   */
  async createSkillCategory(data: Partial<SkillCategory>): Promise<SkillCategory> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-categories`;
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
      const errorMsg = resJson.message || `Failed to create skill category (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing Skill Category
   */
  async updateSkillCategory(
    id: number | string,
    data: Partial<SkillCategory>
  ): Promise<SkillCategory> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-categories/${id}`;
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
      const errorMsg = resJson.message || `Failed to update skill category (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a Skill Category
   */
  async deleteSkillCategory(id: number | string): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-categories/${id}`;
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
      const errorMsg = resJson.message || `Failed to delete skill category (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },

  /**
   * Create a new Skill Item
   */
  async createSkillItem(data: Partial<SkillItem>): Promise<SkillItem> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-items`;
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
      const errorMsg = resJson.message || `Failed to create skill item (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Update an existing Skill Item
   */
  async updateSkillItem(
    id: number | string,
    data: Partial<SkillItem>
  ): Promise<SkillItem> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-items/${id}`;
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
      const errorMsg = resJson.message || `Failed to update skill item (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },

  /**
   * Delete a Skill Item
   */
  async deleteSkillItem(id: number | string): Promise<void> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/skill-items/${id}`;
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
      const errorMsg = resJson.message || `Failed to delete skill item (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }
  },
};
