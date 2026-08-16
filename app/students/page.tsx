import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SITE_METADATA } from "@/src/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  let title = `Students | ${SITE_METADATA.name}`;
  let description: string = SITE_METADATA.description;

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.default_seo_title) {
      title = `Students | ${settings.default_seo_title}`;
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

import { StudentsSupervision } from "@/src/components/home/StudentsSupervision";

export default function StudentsPage() {
  return <StudentsSupervision showViewAll={false} />;
}