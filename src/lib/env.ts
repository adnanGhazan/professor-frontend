/**
 * Environment Variables Configuration
 */

export const env = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
