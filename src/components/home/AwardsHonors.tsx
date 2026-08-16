"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Award } from "@/src/types/award";
import { AwardService } from "@/src/services/award.service";
import { ResearchProject } from "@/src/types/research-project";
import { ResearchProjectService } from "@/src/services/research-project.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface AchievementStatItem {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface AwardsHonorsProps {
  stats?: AchievementStatItem[];
  className?: string;
  showViewAll?: boolean;
}

export const AwardsHonors: React.FC<AwardsHonorsProps> = ({
  stats: statsProp,
  className = "",
  showViewAll = true,
}) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [awardsData, projectsData] = await Promise.all([
        AwardService.getPublicAwards().catch(() => []),
        ResearchProjectService.getPublicResearchProjects().catch(() => []),
      ]);
      setAwards(awardsData);
      setProjects(projectsData);
    } catch (err: unknown) {
      console.error("Failed to load awards/projects:", err);
      setError("Unable to load awards and honors at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Display top 6 awards
  const displayedAwards = awards.slice(0, 6);

  // Dynamic Achievement Statistics Calculations
  const totalAwardsCount = awards.length;

  const internationalAwardsCount = awards.filter((a: any) => {
    const scope = String(a.scope || a.category || a.type || a.level || "").toLowerCase().trim();
    if (scope === "international" || scope === "global" || scope === "world") return true;
    const body = String(a.awarding_body || a.organization || "").toLowerCase();
    const title = String(a.title || "").toLowerCase();
    const desc = String(a.description || "").toLowerCase();
    return (
      body.includes("international") ||
      body.includes("ieee") ||
      body.includes("acm") ||
      body.includes("springer") ||
      body.includes("global") ||
      title.includes("international") ||
      desc.includes("international")
    );
  }).length;

  const nationalAwardsCount = awards.filter((a: any) => {
    const scope = String(a.scope || a.category || a.type || a.level || "").toLowerCase().trim();
    if (scope === "national" || scope === "country" || scope === "state") return true;
    const body = String(a.awarding_body || a.organization || "").toLowerCase();
    const title = String(a.title || "").toLowerCase();
    const desc = String(a.description || "").toLowerCase();
    const isIntl =
      scope === "international" ||
      body.includes("international") ||
      title.includes("international") ||
      desc.includes("international");
    if (isIntl) return false;
    return (
      body.includes("national") ||
      body.includes("presidential") ||
      body.includes("hec") ||
      title.includes("national") ||
      desc.includes("national") ||
      !isIntl
    );
  }).length;

  const grantsCount = projects.filter((p: any) => {
    const funding = String(p.funding_source || "").trim().toLowerCase();
    const status = String(p.status || "").trim().toLowerCase();
    const type = String(p.type || p.category || "").trim().toLowerCase();
    const title = String(p.title || "").trim().toLowerCase();
    if (funding.length > 0 && funding !== "none" && funding !== "n/a") return true;
    if (status.includes("grant") || status.includes("fund") || type.includes("grant") || type.includes("fund")) return true;
    if (title.includes("grant") || title.includes("fund")) return true;
    return Boolean(p.funding_source || p.status || p.title);
  }).length;

  const defaultStats: AchievementStatItem[] = [
    {
      value: String(totalAwardsCount),
      label: "Awards Received",
      description: "Total academic recognitions & honors",
      icon: (
        <svg className="w-6 h-6 text-amber-500 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      ),
    },
    {
      value: String(internationalAwardsCount),
      label: "International Awards",
      description: "Conferred by global scientific societies",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      value: String(nationalAwardsCount),
      label: "National Awards",
      description: "National foundation & university honors",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      value: String(grantsCount),
      label: "Research Grants",
      description: "Competitive funded research proposals",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const achievementStats = statsProp || defaultStats;

  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Ambient background decoration */}
      <div
        className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-400/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-16 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Recognitions & Achievements"
          title="Awards & Honors"
          description="Recognition received for excellence in research, teaching, and academic service."
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
                  <div className="h-6 w-6 bg-slate-300 dark:bg-slate-800 rounded-full" />
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-16" />
                </div>
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-full" />
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
            <Button variant="outline" size="sm" onClick={fetchData} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedAwards.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              🏆
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Awards Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Awards and honors will be added soon. Please check back later.
            </p>
          </div>
        )}

        {/* Responsive Grid of Award Cards */}
        {!isLoading && !error && displayedAwards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedAwards.map((award) => (
              <Card
                key={award.id}
                variant="default"
                hover
                className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500"
              >
                <div>
                  {/* Top Badges: Featured & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1.5">
                      {award.is_featured && (
                        <Badge variant="accent" size="sm" className="font-bold">
                          ★ Featured
                        </Badge>
                      )}
                    </div>

                    {award.award_date && (
                      <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/50">
                        {award.award_date}
                      </span>
                    )}
                  </div>

                  {/* Icon / Image & Title */}
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-start gap-3 mb-2">
                      {/* Image Thumbnail or Trophy Icon Fallback */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center text-xl">
                        {award.image_url && !failedImageIds[award.id] ? (
                          <img
                            src={award.image_url}
                            alt={award.title}
                            className="h-full w-full object-cover"
                            onError={() => setFailedImageIds((prev) => ({ ...prev, [award.id]: true }))}
                          />
                        ) : (
                          <span>🏆</span>
                        )}
                      </div>

                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                        {award.title}
                      </CardTitle>
                    </div>

                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-400">
                      {award.awarding_body || award.organization || "Awarding organization not specified."}
                    </p>
                  </CardHeader>

                  {/* Description */}
                  <CardContent className="p-0 pt-1">
                    <CardDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
                      {award.description || "Award details will be added soon."}
                    </CardDescription>
                  </CardContent>
                </div>

                {/* Footer Link Button if external_url exists */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    ★ Honored
                  </span>

                  {award.external_url && (
                    <a
                      href={award.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 hover:text-amber-500 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>View Announcement</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View All Awards Action Button */}
        {/* View All Awards Action Button */}
        {showViewAll && !isLoading && !error && displayedAwards.length > 0 && (
          <div className="flex justify-center pt-2">
            <Link
              href="/awards"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>View All Awards</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Achievement Statistics Section Below Cards */}
        {/* Achievement Statistics Section Below Cards */}
        <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
              Achievement Statistics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overview of national, international, and research organization honors
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievementStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/50 transition-all duration-300">
                    {stat.icon}
                  </div>
                  <Badge variant="accent" size="sm" className="text-[10px] font-bold uppercase">
                    Honor
                  </Badge>
                </div>

                <span className="block text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {stat.value}
                </span>
                <h4 className="mt-1 text-sm font-bold text-blue-900 dark:text-blue-400 font-sans">
                  {stat.label}
                </h4>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
