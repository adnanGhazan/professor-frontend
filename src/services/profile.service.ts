import { env } from "../lib/env";
import { ProfessorProfile } from "../types/profile";
import { AuthService, ApiValidationError } from "./auth.service";

export const ProfileService = {
  /**
   * Fetch professor profile from backend API (GET /api/v1/profile)
   */
  async getProfile(): Promise<ProfessorProfile | null> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/profile`;
    const token = AuthService.getToken();

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { headers });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Failed to fetch profile (${response.status})`);
      }

      const json = await response.json();
      return json.data || json;
    } catch (error) {
      console.error("ProfileService.getProfile error:", error);
      throw error;
    }
  },

  /**
   * Update or Create professor profile using FormData (POST /api/v1/profile)
   */
  async updateProfile(formData: FormData): Promise<ProfessorProfile> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/profile`;
    const token = AuthService.getToken();

    if (!token) {
      throw new ApiValidationError("Authentication token missing. Please log in again.");
    }

    // Do NOT set Content-Type header when sending FormData!
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({
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
      const errorMsg = data.message || `Profile update failed (${response.status})`;
      throw new ApiValidationError(errorMsg, data.errors);
    }

    return data.data || data;
  },
};
