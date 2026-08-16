import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SITE_METADATA } from "@/src/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  let title = `Gallery | ${SITE_METADATA.name}`;
  let description: string = SITE_METADATA.description;

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.default_seo_title) {
      title = `Gallery | ${settings.default_seo_title}`;
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

import { PhotoGallery } from "@/src/components/home/PhotoGallery";

export default function GalleryPage() {
  return <PhotoGallery showViewAll={false} />;
}
