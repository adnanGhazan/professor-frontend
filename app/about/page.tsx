import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SITE_METADATA } from "@/src/constants/site";
import {
  BiographySection,
  EducationTimeline,
  ExperienceTimeline,
  ResearchSummary,
  SkillsExpertise,
  OfficeContactSection,
} from "@/src/components/about";

export async function generateMetadata(): Promise<Metadata> {
  let title = `About | ${SITE_METADATA.name}`;
  let description =
    "Academic biography, education background, career timeline, research interests, skills, and office contact information.";

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.default_seo_title) {
      title = `About | ${settings.default_seo_title}`;
    }
    if (settings?.default_seo_description) {
      description = settings.default_seo_description;
    }
  } catch (error) {
    // Fallback to static values if API is unavailable
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

export default function AboutPage() {
  return (
    <>
      <BiographySection />
      <EducationTimeline />
      <ExperienceTimeline />
      <ResearchSummary />
      <SkillsExpertise />
      <OfficeContactSection />
    </>
  );
}
