import { env } from "../lib/env";
import { LoginCredentials, LoginResponseData, User } from "../types/auth";

const TOKEN_KEY = "prof_auth_token";
const USER_KEY = "prof_auth_user";

export class ApiValidationError extends Error {
  public errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

export const AuthService = {
  /**
   * Authenticate user with email & password (POST /api/v1/login)
   */
  async login(credentials: LoginCredentials): Promise<LoginResponseData> {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/login`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json().catch(() => ({
        message: response.statusText || "Server error occurred",
      }));

      if (!response.ok) {
        const errorMsg = data.message || `Authentication failed with status ${response.status}`;
        throw new ApiValidationError(errorMsg, data.errors);
      }

      // Extract payload from Laravel standard response format (response.data or data)
      const authData: LoginResponseData = data.data || data;

      if (authData.access_token) {
        AuthService.setToken(authData.access_token);
      }

      if (authData.user) {
        AuthService.setUser(authData.user);
      }

      return authData;
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      console.error("AuthService.login error:", error);
      throw new ApiValidationError("Unable to connect to authentication server. Please check backend connection.");
    }
  },

  /**
   * Store Sanctum Token in localStorage & cookie
   */
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=2592000; SameSite=Lax`;
    }
  },

  /**
   * Retrieve Sanctum Token
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  /**
   * Store Authenticated User
   */
  setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Retrieve Authenticated User
   */
  getUser(): User | null {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  },

  /**
   * Clear auth session
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  },

  /**
   * Change admin password (POST /api/v1/change-password)
   */
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message?: string }> {
    const token = AuthService.getToken();
    if (!token) {
      throw new ApiValidationError("Unauthenticated. Please log in again.");
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/change-password`;
    try {
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

      if (!response.ok) {
        const errorMsg = resJson.message || `Failed to change password (${response.status})`;
        throw new ApiValidationError(errorMsg, resJson.errors);
      }

      return resJson;
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      console.error("AuthService.changePassword error:", error);
      throw new ApiValidationError("Unable to process request. Please try again.");
    }
  },
};
