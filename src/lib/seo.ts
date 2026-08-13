import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SITE_METADATA } from "@/src/constants/site";

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
}

export async function generateSeoMetadata({
  title,
  description,
  path = "",
}: SeoProps = {}): Promise<Metadata> {
  let siteName: string = SITE_METADATA.name;
  let defaultTitle: string = SITE_METADATA.name;
  let defaultDesc: string = SITE_METADATA.description;

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.site_name) {
      siteName = settings.site_name;
    }
    defaultTitle = settings?.default_seo_title || siteName;
    defaultDesc = settings?.default_seo_description || defaultDesc;
  } catch (error) {
    // Silently fallback to defaults if API fails
  }

  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDesc;
  const baseUrl = SITE_METADATA.url;
  const url = `${baseUrl}${path}`;

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url,
      siteName: siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
    },
  };
}
