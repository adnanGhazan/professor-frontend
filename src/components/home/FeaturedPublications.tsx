"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Publication } from "@/src/types/publication";
import { PublicationService } from "@/src/services/publication.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface FeaturedPublicationsProps {
  className?: string;
}

export const FeaturedPublications: React.FC<FeaturedPublicationsProps> = ({
  className = "",
}) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PublicationService.getPublicPublications();
      setPublications(data);
    } catch (err: unknown) {
      console.error("Failed to load public featured publications:", err);
      setError("Unable to load featured publications at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Display top 6 records
  const displayedPublications = publications.slice(0, 6);

  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Ambient background glow decoration */}
      <div
        className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-12 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Scholarly Output"
          title="Featured Publications"
          description="Selected peer-reviewed research papers, journal articles, and proceedings."
          align="center"
        />

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/40 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-24" />
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-12" />
                </div>
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/2" />
                <div className="pt-4 flex justify-between">
                  <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-20" />
                  <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!isLoading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <p className="text-sm font-medium text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPublications} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedPublications.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
              📚
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Publications Available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Featured publications will be updated soon. Please check back later.
            </p>
          </div>
        )}

        {/* Responsive Grid of Publication Cards */}
        {!isLoading && !error && displayedPublications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPublications.map((pub) => (
              <Card
                key={pub.id}
                variant="default"
                hover
                className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
              >
                <div>
                  {/* Top Badges: Category/Type, Featured Badge & Year */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="primary" size="sm" className="font-semibold">
                        {pub.research_area?.title || pub.publication_type || "Research"}
                      </Badge>

                      {pub.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {pub.publication_year || pub.publication_date?.slice(0, 4) || "N/A"}
                    </span>
                  </div>

                  {/* Title */}
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                      {pub.title}
                    </CardTitle>
                  </CardHeader>

                  {/* Venue & Authors */}
                  <CardContent className="p-0 space-y-3">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-400 leading-normal line-clamp-1">
                      {pub.journal || "Publication venue not specified"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal line-clamp-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Authors:</span>{" "}
                      {pub.authors || "Authors not specified"}
                    </p>
                  </CardContent>
                </div>

                {/* Footer: Citations, DOI, & PDF/URL Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {pub.citation_count ?? 0} Citations
                    </span>

                    {/* Show DOI action if present */}
                    {pub.doi ? (
                      <span className="truncate max-w-[140px]" title={`DOI: ${pub.doi}`}>
                        DOI: {pub.doi}
                      </span>
                    ) : null}
                  </div>

                  {/* PDF Document and External Link Buttons */}
                  <div className="flex items-center gap-2">
                    {pub.pdf_url && (
                      <a
                        href={pub.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          className="group-hover:bg-blue-900 group-hover:text-white dark:group-hover:bg-blue-600 font-semibold transition-colors text-xs"
                          leftIcon={<span>📄</span>}
                        >
                          PDF Paper
                        </Button>
                      </a>
                    )}

                    {pub.external_url && (
                      <a
                        href={pub.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={pub.pdf_url ? "" : "flex-1"}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth={!pub.pdf_url}
                          className="font-semibold text-xs px-3"
                          title="Open External URL"
                        >
                          🔗 Link ↗
                        </Button>
                      </a>
                    )}

                    {!pub.pdf_url && !pub.external_url && (
                      <Link href="/publications" className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          className="group-hover:bg-blue-900 group-hover:text-white dark:group-hover:bg-blue-600 font-semibold transition-colors text-xs"
                        >
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View All Publications Action Button */}
        <div className="flex justify-center pt-6">
          <Link href="/publications" passHref>
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
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              View All Publications
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};
