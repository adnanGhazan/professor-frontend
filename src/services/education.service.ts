import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { Education } from "../types/education";
import { ApiResponse } from "../types/api";

export const EducationService = {
  /**
   * Fetch all education records from backend API (GET /api/v1/educations)
   */
  async getEducations(): Promise<Education[]> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/educations`;

    try {
      const response = await fetcher<ApiResponse<Education[]> | Education[]>(url);

      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray((response as ApiResponse<Education[]>).data)) {
        return (response as ApiResponse<Education[]>).data;
      }
      return [];
    } catch (error) {
      console.error("EducationService.getEducations error:", error);
      throw error;
    }
  },
};
