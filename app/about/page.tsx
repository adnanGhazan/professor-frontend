import type { Metadata } from "next";
import {
  BiographySection,
  EducationTimeline,
  ExperienceTimeline,
  ResearchSummary,
  SkillsExpertise,
  OfficeContactSection,
} from "@/src/components/about";

export const metadata: Metadata = {
  title: "About | Dr. Alex Morgan - Professor of Computer Science & AI",
  description:
    "Academic biography, education background, career timeline, research interests, skills, and office contact information.",
};

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
