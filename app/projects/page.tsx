"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ResearchProject } from "@/src/types/research-project";
import { ResearchProjectService } from "@/src/services/research-project.service";
import { Section } from "@/src/components/ui/section";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"research" | "training">("research");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ResearchProjectService.getPublicResearchProjects();
      // Ensure visible items with featured items prioritized
      const visibleSorted = data
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
      setProjects(visibleSorted);
    } catch (err: unknown) {
      console.error("Failed to load public projects:", err);
      setError("Unable to load projects at this time. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleImageError = (id: string | number) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  };

  const formatTimeline = (startDate?: string | null, endDate?: string | null, status?: string | null) => {
    const startYear = startDate ? startDate.slice(0, 4) : null;
    const endYear = endDate ? endDate.slice(0, 4) : null;

    if (startYear && endYear) return `${startYear} — ${endYear}`;
    if (startYear) {
      return status?.toLowerCase() === "completed" ? `${startYear}` : `${startYear} — Present`;
    }
    if (endYear) return `Until ${endYear}`;
    return status?.toLowerCase() === "ongoing" ? "Present" : "Timeline TBD";
  };

  // Filter projects by project_type (defaulting missing project_type to 'research')
  const isResearch = (p: ResearchProject) => !p.project_type || p.project_type.toLowerCase() === "research";
  const isTraining = (p: ResearchProject) => p.project_type?.toLowerCase() === "training";

  const displayedProjects = projects.filter((p) =>
    activeTab === "research" ? isResearch(p) : isTraining(p)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero / Header Section */}
      <Section variant="default" padding="lg" className="relative overflow-hidden pt-12 pb-8">
        {/* Background Decorative Gradient Orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <SectionHeading
            eyebrow="Initiatives & Grants"
            title="Projects"
            description="Explore our scientific research grants, fundamental research initiatives, training projects, and industrial collaborations."
            align="center"
          />

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("research")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === "research"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Research Projects
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("training")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === "training"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Training Projects
            </button>
          </div>
        </div>
      </Section>

      {/* Main Content Section */}
      <Section variant="default" padding="lg" className="relative overflow-hidden pt-0 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* LOADING SKELETON STATE */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((skeletonId) => (
                <div
                  key={skeletonId}
                  className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 animate-pulse"
                >
                  <div className="w-full h-44 rounded-2xl bg-slate-800" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-4 bg-slate-800 rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-slate-800 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-slate-800 rounded w-full" />
                    <div className="h-3.5 bg-slate-800 rounded w-4/5" />
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between">
                    <div className="h-8 bg-slate-800 rounded-xl w-1/2" />
                    <div className="h-8 bg-slate-800 rounded-xl w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE WITH RETRY BUTTON */}
          {!isLoading && error && (
            <div className="p-8 sm:p-12 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-100">
                  Failed to Load Projects
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={fetchProjects}
                className="border-red-500/40 text-red-400 hover:bg-red-500/20 cursor-pointer"
              >
                Retry Loading
              </Button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !error && displayedProjects.length === 0 && (
            <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-200">
                {activeTab === "research" ? "No Research Projects Found" : "No Training Projects Found"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {activeTab === "research"
                  ? "Research project listings will be updated shortly. Check back soon."
                  : "Training project listings will be updated shortly. Check back soon."}
              </p>
            </div>
          )}

          {/* CARDS GRID VIEW */}
          {!isLoading && !error && displayedProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProjects.map((proj) => {
                const hasValidImage = Boolean(proj.image_url) && !failedImageIds[proj.id];
                const descriptionText = proj.description && proj.description.trim().length > 0
                  ? proj.description
                  : "Project details will be added soon.";
                const fundingAgencyText = proj.funding_source && proj.funding_source.trim().length > 0
                  ? proj.funding_source
                  : "Funding source not specified.";
                const timelineText = formatTimeline(proj.start_date, proj.end_date, proj.status);

                return (
                  <Card
                    key={proj.id}
                    variant="default"
                    hover
                    className="group relative flex flex-col justify-between bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500/80 rounded-3xl"
                  >
                    <div className="space-y-4">
                      {/* Cover Image / Fallback Graphic */}
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {hasValidImage ? (
                          <img
                            src={proj.image_url!}
                            alt={proj.title}
                            onError={() => handleImageError(proj.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                            <svg
                              className="w-10 h-10 mb-1 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
                            </svg>
                            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                              {proj.project_type?.toLowerCase() === "training" ? "Training Project" : "Research Grant"}
                            </span>
                          </div>
                        )}

                        {/* Featured Overlay Badge */}
                        {proj.is_featured && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge
                              variant="primary"
                              size="sm"
                              className="bg-amber-500/90 text-slate-950 font-bold border border-amber-400 shadow-md backdrop-blur-md px-2.5 py-0.5"
                            >
                              ★ Featured
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Header: Status Badge & Duration */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {proj.status ? (
                          <Badge
                            variant={proj.status.toLowerCase() === "ongoing" ? "success" : "secondary"}
                            size="sm"
                            className="font-semibold text-[11px]"
                            icon={
                              proj.status.toLowerCase() === "ongoing" ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ) : undefined
                            }
                          >
                            {proj.status}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm" className="font-semibold text-[11px]">
                            Project
                          </Badge>
                        )}

                        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                          {timelineText}
                        </span>
                      </div>

                      {/* Title & Research Area Badge */}
                      <CardHeader className="p-0 space-y-2">
                        {proj.research_area && (
                          <div className="inline-block">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                              {proj.research_area.title}
                            </span>
                          </div>
                        )}
                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                          {proj.title}
                        </CardTitle>
                      </CardHeader>

                      {/* Funding Agency & Description */}
                      <CardContent className="p-0 space-y-3">
                        {proj.funding_source && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                            <svg className="w-4 h-4 text-amber-500 shrink-0 fill-current" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356.257l4 4a1 1 0 001.388 0l4-4a1 1 0 01.356-.257l2.644-1.131a1 1 0 000-1.84l-7-3z" />
                            </svg>
                            <span className="line-clamp-1">{fundingAgencyText}</span>
                          </div>
                        )}

                        <CardDescription className="text-xs text-slate-400 leading-relaxed font-normal line-clamp-3">
                          {descriptionText}
                        </CardDescription>
                      </CardContent>
                    </div>

                    {/* External Link Action if project_url exists */}
                    {proj.project_url && (
                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                        <a
                          href={proj.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          <span>Visit Project Website</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
