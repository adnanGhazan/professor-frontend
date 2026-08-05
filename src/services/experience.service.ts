import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { Experience } from "../types/experience";
import { ApiResponse } from "../types/api";

export const ExperienceService = {
  /**
   * Fetch all experience records from backend API (GET /api/v1/experiences)
   */
  async getExperiences(): Promise<Experience[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/experiences`;

    try {
      const response = await fetcher<
        ApiResponse<Experience[] | { items: Experience[] }> | Experience[] | { items: Experience[] }
      >(url);

      if (Array.isArray(response)) {
        return response;
      }

      if (response && "data" in response) {
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: Experience[] }).items)) {
          return (data as { items: Experience[] }).items;
        }
      }

      if (response && typeof response === "object" && "items" in response && Array.isArray((response as { items: Experience[] }).items)) {
        return (response as { items: Experience[] }).items;
      }

      return [];
    } catch (error) {
      console.error("ExperienceService.getExperiences error:", error);
      throw error;
    }
  },
};
