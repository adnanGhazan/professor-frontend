"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ResearchArea } from "@/src/types/research-area";
import { ResearchAreaService } from "@/src/services/research-area.service";
import { Section } from "@/src/components/ui/section";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

export default function ResearchPage() {
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ResearchAreaService.getPublicResearchAreas();
      // Filter visible items and sort by sort_order ascending
      const visibleSorted = data
        .filter((item) => item.is_visible !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setAreas(visibleSorted);
    } catch (err: unknown) {
      console.error("Failed to load research areas:", err);
      setError("Unable to load research areas at this time. Please check your connection and try again.");
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
            eyebrow="Specialization & Innovation"
            title="Academic Research Areas"
            description="Explore our core research domains, ongoing scientific investigations, multi-disciplinary collaborations, and active areas of exploration."
            align="center"
          />
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
                  className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 animate-pulse"
                >
                  <div className="w-full h-48 rounded-2xl bg-slate-800" />
                  <div className="h-6 bg-slate-800 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-slate-800 rounded w-5/6" />
                    <div className="h-4 bg-slate-800 rounded w-4/6" />
                  </div>
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="h-3 bg-slate-800/80 rounded w-full" />
                    <div className="h-3 bg-slate-800/80 rounded w-2/3" />
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
                  Failed to Load Research Areas
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={fetchAreas}
                className="border-red-500/40 text-red-400 hover:bg-red-500/20 cursor-pointer"
              >
                Retry Loading
              </Button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !error && areas.length === 0 && (
            <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-200">
                No Research Areas Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No active research areas are registered at the moment. Please check back later.
              </p>
            </div>
          )}

          {/* RESEARCH AREAS CARDS GRID */}
          {!isLoading && !error && areas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {areas.map((area) => {
                const hasValidImage = Boolean(area.image_url) && !failedImageIds[area.id];
                const shortDesc = area.short_description && area.short_description.trim().length > 0
                  ? area.short_description
                  : "Research details will be added soon.";

                const targetSlug = area.slug || area.id;

                return (
                  <Card
                    key={area.id}
                    variant="default"
                    hover
                    className="group relative flex flex-col justify-between bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500/80 rounded-3xl"
                  >
                    <div className="space-y-5">
                      {/* Cover Image / Fallback Graphic */}
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {hasValidImage ? (
                          <img
                            src={area.image_url!}
                            alt={area.title}
                            onError={() => handleImageError(area.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                            <svg
                              className="w-12 h-12 mb-2 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300"
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
                              Academic Domain
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

                      {/* Header: Title */}
                      <CardHeader className="p-0 space-y-1">
                        <CardTitle className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors font-sans">
                          {area.title}
                        </CardTitle>
                      </CardHeader>

                      {/* Short Description Only */}
                      <CardContent className="p-0 space-y-3">
                        <CardDescription className="text-sm text-slate-300 leading-relaxed font-medium line-clamp-3">
                          {shortDesc}
                        </CardDescription>
                      </CardContent>
                    </div>

                    {/* Footer View Details Button */}
                    <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">
                        Area #{area.sort_order ?? 1}
                      </span>
                      <Link href={`/research/${targetSlug}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500/40 text-blue-400 hover:bg-blue-500/20 font-semibold cursor-pointer"
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
                    </div>
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

