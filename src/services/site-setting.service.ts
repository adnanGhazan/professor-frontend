import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { SiteSettingsMap } from "../types/site-setting";
import { ApiResponse } from "../types/api";
import { AuthService, ApiValidationError } from "./auth.service";

export const SiteSettingService = {
  /**
   * Fetch site settings dictionary (GET /api/v1/site-settings)
   */
  async getSiteSettings(): Promise<SiteSettingsMap> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/site-settings`;

    try {
      const response = await fetcher<any>(url);

      if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) {
        return response.data as SiteSettingsMap;
      }
      if (response && typeof response === "object" && !Array.isArray(response)) {
        return response as SiteSettingsMap;
      }
      return {};
    } catch (error) {
      console.error("SiteSettingService.getSiteSettings error:", error);
      throw error;
    }
  },

  /**
   * Update site settings in bulk (PUT /api/v1/site-settings with POST fallback)
   */
  async updateSiteSettings(
    settings: SiteSettingsMap
  ): Promise<SiteSettingsMap> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/site-settings`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError(
        "Authentication token missing. Please log in again."
      );
    }

    const payload = { settings };

    // Try PUT request first
    let response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // If PUT fails with 405 Method Not Allowed, fallback to POST
    if (response.status === 405) {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }

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
        `Failed to update site settings (${response.status})`;
      throw new ApiValidationError(errorMsg, resJson.errors);
    }

    return resJson.data || resJson;
  },
};
