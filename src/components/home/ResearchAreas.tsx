"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ResearchArea } from "@/src/types/research-area";
import { ResearchAreaService } from "@/src/services/research-area.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface ResearchAreasProps {
  className?: string;
}

export const ResearchAreas: React.FC<ResearchAreasProps> = ({ className = "" }) => {
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ResearchAreaService.getPublicResearchAreas();
      // Ensure only visible items are shown and sorted by sort_order ascending
      const visibleSorted = data
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setAreas(visibleSorted);
    } catch (err: unknown) {
      console.error("Failed to load public research areas:", err);
      setError("Unable to load research areas at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleImageError = (id: string | number) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  };

  // Limit display to top 6 visible records
  const displayedAreas = areas.slice(0, 6);

  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Background Decorative Gradient Orbs */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-12 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Specialization"
          title="Research Areas"
          description="Current research domains, core scientific focus, and active exploration."
          align="center"
        />

        {/* LOADING SKELETON STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse"
              >
                <div className="w-full h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
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
                Failed to Load Research Areas
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAreas}
              className="mt-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              Retry Loading
            </Button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && displayedAreas.length === 0 && (
          <div className="p-12 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Research Areas Available
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Research areas will be updated shortly. Check back soon.
            </p>
          </div>
        )}

        {/* CARDS GRID VIEW */}
        {!isLoading && !error && displayedAreas.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedAreas.map((area) => {
                const hasValidImage = Boolean(area.image_url) && !failedImageIds[area.id];
                const displayDesc =
                  (area.short_description && area.short_description.trim().length > 0)
                    ? area.short_description
                    : (area.description && area.description.trim().length > 0)
                      ? area.description
                      : "Research details will be added soon.";

                return (
                  <Card
                    key={area.id}
                    variant="default"
                    hover
                    className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl"
                  >
                    <div className="space-y-4">
                      {/* Cover Image / Fallback Graphic */}
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shrink-0">
                        {hasValidImage ? (
                          <img
                            src={area.image_url!}
                            alt={area.title}
                            onError={() => handleImageError(area.id)}
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
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                              <path d="M2 12h20" />
                            </svg>
                            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                              Research Domain
                            </span>
                          </div>
                        )}

                        {/* Featured Badge Overlay */}
                        {area.is_featured && (
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

                      {/* Content: Title & Short Description */}
                      <CardHeader className="p-0 space-y-2">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans">
                          {area.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-0">
                        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
                          {displayDesc}
                        </CardDescription>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* View All Research Action Button */}
            <div className="flex justify-center pt-6">
              <Link href="/research">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-8 shadow-md"
                  rightIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  }
                >
                  View All Research
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Section>
  );
};
