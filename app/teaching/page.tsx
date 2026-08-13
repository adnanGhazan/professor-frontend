import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SITE_METADATA } from "@/src/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  let title = `Teaching | ${SITE_METADATA.name}`;
  let description: string = SITE_METADATA.description;

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.default_seo_title) {
      title = `Teaching | ${settings.default_seo_title}`;
    }
    if (settings?.default_seo_description) {
      description = settings.default_seo_description;
    }
  } catch (error) {
    // Fallback
  }

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

import { TeachingExperience } from "@/src/components/home/TeachingExperience";

export default function TeachingPage() {
  return <TeachingExperience />;
}
