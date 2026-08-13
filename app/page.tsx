import {
  HeroSection,
  ProfessorHighlights,
  ResearchAreas,
  FeaturedPublications,
  ResearchProjects,
  TeachingExperience,
  StudentsSupervision,
  AwardsHonors,
  LatestNews,
  LatestVideos,
  PhotoGallery,
} from "@/src/components/home";
import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SITE_METADATA } from "@/src/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  let title = `${SITE_METADATA.name} | Home`;
  let description: string = SITE_METADATA.description;

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.default_seo_title) {
      title = settings.default_seo_title;
    }
    if (settings?.default_seo_description) {
      description = settings.default_seo_description;
    }
  } catch (error) {
    // Fall back to current values if API is unavailable
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProfessorHighlights />
      <ResearchAreas />
      <FeaturedPublications />
      <ResearchProjects />
      <TeachingExperience />
      <StudentsSupervision />
      <AwardsHonors />
      <LatestNews />
      <LatestVideos />
      <PhotoGallery />
    </>
  );
}
