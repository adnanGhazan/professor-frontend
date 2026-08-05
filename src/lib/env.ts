/**
 * Environment Variables Configuration
 */

export const env = {
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000/api/v1",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
