"use client";

import React, { useEffect, useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { EmptyState } from "../ui/empty-state";
import { EducationService } from "../../services/education.service";
import { Education } from "../../types/education";

export interface EducationTimelineProps {
  initialData?: Education[];
  className?: string;
}

export const EducationTimeline: React.FC<EducationTimelineProps> = ({
  initialData,
  className = "",
}) => {
  const [educations, setEducations] = useState<Education[]>(initialData || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchEducations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EducationService.getEducations();
      setEducations(data);
    } catch (err) {
      console.error("Failed to fetch education records:", err);
      setError("Unable to connect to backend API. Please ensure Laravel backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchEducations();
    }
  }, [initialData]);

  const formatYearRange = (edu: Education): string => {
    if (edu.year_range) return edu.year_range;
    if (edu.start_year && edu.end_year) return `${edu.start_year} — ${edu.end_year}`;
    if (edu.passing_year) return `Class of ${edu.passing_year}`;
    if (edu.end_year) return `${edu.end_year}`;
    return "Academic Term";
  };

  const formatHonors = (honors?: string[] | string): string[] => {
    if (!honors) return [];
    if (Array.isArray(honors)) return honors;
    return honors.split(",").map((h) => h.trim());
  };

  return (
    <Section variant="surface" padding="lg" id="education-timeline" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Academic Background"
          title="Education Timeline"
          description="Formal academic degrees, doctoral research, and university honors."
          align="center"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Fetching education records from API...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center space-y-4">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={fetchEducations}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && educations.length === 0 && (
          <EmptyState
            title="No Education Records Found"
            description="No academic background records are currently registered in the database."
          />
        )}

        {/* Timeline Content */}
        {!isLoading && !error && educations.length > 0 && (
          <div className="relative max-w-4xl mx-auto pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
            {educations.map((edu) => {
              const yearsFormatted = formatYearRange(edu);
              const honorsList = formatHonors(edu.honors ?? undefined);

              return (
                <div key={edu.id} className="relative group">
                  {/* Bullet Node Icon */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-900 dark:bg-blue-500 group-hover:scale-125 transition-transform duration-200" />

                  <Card
                    variant="default"
                    hover
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider font-mono bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-md border border-blue-200/60 dark:border-blue-900/50">
                        {yearsFormatted}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {edu.institution}
                      </span>
                    </div>

                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {edu.degree}
                      </CardTitle>
                      {edu.field && (
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                          {edu.field}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="p-0 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                      {edu.description && (
                        <p className="leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
                          {edu.description}
                        </p>
                      )}

                      {edu.thesis_title && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px] mb-1">
                            Thesis Title
                          </span>
                          <p className="italic font-medium text-slate-700 dark:text-slate-300">
                            &ldquo;{edu.thesis_title}&rdquo;
                          </p>
                          {edu.advisor && (
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Advisor: {edu.advisor}
                            </span>
                          )}
                        </div>
                      )}

                      {honorsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {honorsList.map((honor, index) => (
                            <Badge key={index} variant="accent" size="sm" className="text-[10px]">
                              ★ {honor}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
};
