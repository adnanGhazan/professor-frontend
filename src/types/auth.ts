/**
 * Authentication Entity & API Types
 */

export interface User {
  id: number | string;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface LoginResponseData {
  user: User;
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
