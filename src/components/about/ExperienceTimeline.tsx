"use client";

import React, { useEffect, useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { EmptyState } from "../ui/empty-state";
import { ExperienceService } from "../../services/experience.service";
import { Experience } from "../../types/experience";

export type ExperienceItem = Experience;

export interface ExperienceTimelineProps {
  initialData?: Experience[];
  className?: string;
}

export const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({
  initialData,
  className = "",
}) => {
  const [experiences, setExperiences] = useState<Experience[]>(initialData || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ExperienceService.getExperiences();
      setExperiences(data);
    } catch (err) {
      console.error("Failed to fetch experience records:", err);
      setError("Unable to connect to backend API. Please ensure Laravel backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchExperiences();
    }
  }, [initialData]);

  const formatPeriod = (exp: Experience): string => {
    if (exp.period) return exp.period;
    const start = exp.start_date ? exp.start_date.substring(0, 4) : "";
    const end = exp.is_current
      ? "Present"
      : exp.end_date
      ? exp.end_date.substring(0, 4)
      : "Present";
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    return "Career Appointment";
  };

  const getResponsibilities = (exp: Experience): string[] => {
    if (Array.isArray(exp.responsibilities)) return exp.responsibilities;
    if (typeof exp.responsibilities === "string") {
      return exp.responsibilities.split("\n").filter((line) => line.trim().length > 0);
    }
    if (exp.description) {
      return exp.description.split("\n").filter((line) => line.trim().length > 0);
    }
    return [];
  };

  return (
    <Section variant="default" padding="lg" id="experience-timeline" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Career Appointments"
          title="Professional Experience"
          description="Academic appointments, research leadership, and industry sabbatical positions."
          align="center"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Fetching experience records from API...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center space-y-4">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={fetchExperiences}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && experiences.length === 0 && (
          <EmptyState
            title="No Experience Records Found"
            description="No professional experience records are currently registered in the database."
          />
        )}

        {/* Timeline Content */}
        {!isLoading && !error && experiences.length > 0 && (
          <div className="relative max-w-4xl mx-auto pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-10">
            {experiences.map((exp) => {
              const period = formatPeriod(exp);
              const role = exp.role || exp.position;
              const organization = exp.organization || exp.institution;
              const type = exp.type;
              const responsibilities = getResponsibilities(exp);

              return (
                <div key={exp.id} className="relative group">
                  {/* Bullet Node Icon */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-amber-500 group-hover:scale-125 transition-transform duration-200" />

                  <Card
                    variant="default"
                    hover
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-mono bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/50">
                        {period}
                      </span>
                      {type && (
                        <Badge variant={type === "Visiting Industry" ? "accent" : "primary"} size="sm">
                          {type}
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {role}
                      </CardTitle>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                        {organization}
                        {exp.location && (
                          <>
                            {" — "}
                            <span className="font-normal text-slate-500 dark:text-slate-400">{exp.location}</span>
                          </>
                        )}
                      </p>
                    </CardHeader>

                    {responsibilities.length > 0 && (
                      <CardContent className="p-0 pt-2 space-y-2">
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          {responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                              <span>{resp.replace(/^[•\-\*]\s*/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
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
