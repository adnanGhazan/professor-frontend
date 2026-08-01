/**
 * Site Metadata Constants
 */

export const SITE_METADATA = {
  name: "Professor",
  description: "Enterprise Academic & Professional Platform",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;
