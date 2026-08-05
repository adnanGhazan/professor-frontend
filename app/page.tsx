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
} from "@/src/components/home";

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
    </>
  );
}
