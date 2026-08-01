import { fetcher } from "../lib/api";
import { env } from "../lib/env";
import { UserProfile, UpdateProfilePayload } from "../types/profile";
import { ApiResponse } from "../types/api";

export const ProfileService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return fetcher<ApiResponse<UserProfile>>(`${env.NEXT_PUBLIC_API_BASE_URL}/profile`);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> {
    return fetcher<ApiResponse<UserProfile>>(`${env.NEXT_PUBLIC_API_BASE_URL}/profile`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
