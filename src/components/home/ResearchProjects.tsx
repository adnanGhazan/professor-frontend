"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ResearchProject } from "@/src/types/research-project";
import { ResearchProjectService } from "@/src/services/research-project.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface ResearchProjectsProps {
  className?: string;
}

export const ResearchProjects: React.FC<ResearchProjectsProps> = ({ className = "" }) => {
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
      const sortedProjects = data
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
      setProjects(sortedProjects);
    } catch (err: unknown) {
      console.error("Failed to load public research projects:", err);
      setError("Unable to load research projects at this time.");
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

  const currentTabProjects = projects.filter((p) =>
    activeTab === "research" ? isResearch(p) : isTraining(p)
  );

  // Limit display to top 6 projects of active tab
  const displayedProjects = currentTabProjects.slice(0, 6);

  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Ambient Background Decoration */}
      <div
        className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-12 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Funded Initiatives"
          title="Research & Training Projects"
          description="Ongoing scientific grants, fundamental research initiatives, training projects, and multi-disciplinary collaborations."
          align="center"
        />

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("research")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === "research"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            Research Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("training")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === "training"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            Training Projects
          </button>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 animate-pulse"
              >
                <div className="w-full h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE WITH RETRY BUTTON */}
        {!isLoading && error && (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Failed to Load Projects
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              className="mt-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              Retry Loading
            </Button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && displayedProjects.length === 0 && (
          <div className="p-12 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {activeTab === "research" ? "No Research Projects Found" : "No Training Projects Found"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl"
                >
                  <div className="space-y-4">
                    {/* Cover Image / Fallback Graphic */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shrink-0">
                      {hasValidImage ? (
                        <img
                          src={proj.image_url!}
                          alt={proj.title}
                          onError={() => handleImageError(proj.id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 dark:text-slate-600">
                          <svg
                            className="w-10 h-10 mb-1 group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300"
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

                      <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                        {timelineText}
                      </span>
                    </div>

                    {/* Title & Research Area Badge */}
                    <CardHeader className="p-0 space-y-2">
                      {proj.research_area && (
                        <div className="inline-block">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                            {proj.research_area.title}
                          </span>
                        </div>
                      )}
                      <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                        {proj.title}
                      </CardTitle>
                    </CardHeader>

                    {/* Funding Agency & Description */}
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-400">
                        <svg className="w-4 h-4 text-amber-500 shrink-0 fill-current" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356.257l4 4a1 1 0 001.388 0l4-4a1 1 0 01.356-.257l2.644-1.131a1 1 0 000-1.84l-7-3z" />
                        </svg>
                        <span className="line-clamp-1">{fundingAgencyText}</span>
                      </div>

                      <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
                        {descriptionText}
                      </CardDescription>
                    </CardContent>
                  </div>

                  {/* Actions & Links */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
                    <Link href="/projects" className="flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        className="justify-between text-blue-900 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 font-semibold cursor-pointer"
                        rightIcon={
                          <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        }
                      >
                        View Details
                      </Button>
                    </Link>

                    {/* External Link Action if project_url exists */}
                    {proj.project_url && (
                      <a
                        href={proj.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors border border-slate-200/60 dark:border-slate-700/60 shrink-0"
                        title="Open Project Website"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All Projects Action Button */}
        <div className="flex justify-center pt-6">
          <Link href="/projects">
            <Button
              variant="primary"
              size="lg"
              className="px-8 shadow-md cursor-pointer"
              rightIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};
