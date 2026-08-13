"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ResearchArea } from "@/src/types/research-area";
import { ResearchProject } from "@/src/types/research-project";
import { ResearchAreaService } from "@/src/services/research-area.service";
import { ResearchProjectService } from "@/src/services/research-project.service";
import { Section } from "@/src/components/ui/section";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

export default function ResearchAreaDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [area, setArea] = useState<ResearchArea | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch public research areas
      const areas = await ResearchAreaService.getPublicResearchAreas();
      let matchedArea = areas.find(
        (a) => String(a.slug) === String(slug) || String(a.id) === String(slug)
      );

      // Fallback: try fetching by ID directly if slug was not matched in list
      if (!matchedArea) {
        try {
          matchedArea = await ResearchAreaService.getResearchAreaById(slug);
        } catch (e) {
          // ignore
        }
      }

      if (!matchedArea) {
        setError("The requested research area could not be found.");
        setIsLoading(false);
        return;
      }

      setArea(matchedArea);

      // 2. Fetch related projects if available
      try {
        const projects = await ResearchProjectService.getPublicResearchProjects();
        const areaIdStr = String(matchedArea.id);
        const areaSlugStr = matchedArea.slug ? String(matchedArea.slug) : "";

        const filtered = projects.filter((p) => {
          if (p.research_area_id !== null && p.research_area_id !== undefined) {
            if (String(p.research_area_id) === areaIdStr) return true;
          }
          if (p.research_area) {
            if (String(p.research_area.id) === areaIdStr) return true;
            if (p.research_area.slug && String(p.research_area.slug) === areaSlugStr) return true;
          }
          return false;
        });

        setRelatedProjects(filtered);
      } catch (projErr) {
        console.warn("Could not load related projects:", projErr);
      }
    } catch (err: unknown) {
      console.error("Failed to load research area details:", err);
      setError("Unable to load research area details at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasValidImage = Boolean(area?.image_url) && !imageFailed;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Back Navigation Bar */}
      <Section variant="default" padding="sm" className="pt-8 pb-4 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/research">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-900 cursor-pointer"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back to Research Areas
            </Button>
          </Link>
        </div>
      </Section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* LOADING STATE */}
        {isLoading && (
          <div className="space-y-8 animate-pulse">
            <div className="h-10 bg-slate-900 rounded-xl w-2/3" />
            <div className="w-full h-80 bg-slate-900 rounded-3xl" />
            <div className="space-y-3">
              <div className="h-5 bg-slate-900 rounded w-full" />
              <div className="h-5 bg-slate-900 rounded w-5/6" />
              <div className="h-5 bg-slate-900 rounded w-4/6" />
            </div>
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!isLoading && (error || !area) && (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-6 max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Research Area Not Found</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {error || "The requested research area could not be located."}
              </p>
            </div>
            <Link href="/research">
              <Button variant="primary" size="md">
                Browse All Research Areas
              </Button>
            </Link>
          </div>
        )}

        {/* MAIN DETAIL CONTENT */}
        {!isLoading && !error && area && (
          <div className="space-y-12">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {area.is_featured && (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="bg-amber-500/90 text-slate-950 font-bold border border-amber-400 px-3 py-1"
                  >
                    ★ Featured Research Area
                  </Badge>
                )}
                <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                  Domain #{area.sort_order ?? 1}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight">
                {area.title}
              </h1>

              {area.short_description && (
                <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed max-w-4xl">
                  {area.short_description}
                </p>
              )}
            </div>

            {/* Banner Image or Placeholder */}
            <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
              {hasValidImage ? (
                <img
                  src={area.image_url!}
                  alt={area.title}
                  onError={() => setImageFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <svg
                    className="w-20 h-20 mb-3 text-blue-400/60"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
                    Academic Research Domain
                  </span>
                </div>
              )}
            </div>

            {/* Detailed Description */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-6">
              <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-4">
                Overview & Scientific Investigation
              </h2>
              <div className="text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-normal text-base sm:text-lg">
                {area.description && area.description.trim().length > 0
                  ? area.description
                  : area.short_description || "Comprehensive documentation and research reports will be published soon."}
              </div>
            </div>

            {/* Related Research Projects Section */}
            {relatedProjects.length > 0 && (
              <div className="space-y-6 pt-6">
                <SectionHeading
                  eyebrow="Initiatives"
                  title="Related Research Projects"
                  description="Active investigations and funded projects associated with this research domain."
                  align="left"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedProjects.map((project) => (
                    <Card
                      key={project.id}
                      variant="default"
                      className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" size="sm" className="border-blue-500/40 text-blue-400">
                            {project.status || "Active Project"}
                          </Badge>
                          {project.funding_source && (
                            <span className="text-xs font-mono text-slate-400">
                              {project.funding_source}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-100">{project.title}</h3>

                        {project.description && (
                          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {project.project_url && (
                        <div className="pt-3 border-t border-slate-800/80">
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            <span>Visit Project Website</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
