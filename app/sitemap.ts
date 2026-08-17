import { MetadataRoute } from "next";
import { SITE_METADATA } from "@/src/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_METADATA.url || "http://localhost:3000";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/publications`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/students`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/awards`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
  ];
}
