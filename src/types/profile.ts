/**
 * Profile Domain Types
 */

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}
