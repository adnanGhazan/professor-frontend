"use client";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { TeachingCourse } from "@/src/types/teaching";
import { TeachingService } from "@/src/services/teaching.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface TeachingStatItem {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface TeachingExperienceProps {
  stats?: TeachingStatItem[];
  className?: string;
  showViewAll?: boolean;
}

export const TeachingExperience: React.FC<TeachingExperienceProps> = ({
  className = "",
  showViewAll = true,
}) => {
  const [courses, setCourses] = useState<TeachingCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Public Teaching Courses
  const fetchTeachings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await TeachingService.getPublicTeachings();
      setCourses(data);
    } catch (err: unknown) {
      console.error("Failed to load public teaching records:", err);
      setError("Unable to load teaching courses at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachings();
  }, [fetchTeachings]);

  // Display first 6 visible courses
  const displayedCourses = courses.slice(0, 6);

  // Helper for badge variant based on course level
  const getLevelBadgeVariant = (level?: string | null) => {
    if (!level) return "default";
    const l = level.toLowerCase();
    if (l.includes("doctoral") || l.includes("phd")) return "accent";
    if (l.includes("graduate") || l.includes("postgraduate") || l.includes("ms")) return "primary";
    if (l.includes("undergraduate") || l.includes("bs")) return "secondary";
    return "default";
  };

  // Dynamic Teaching Statistics
  const totalCount = courses.length;
  const currentCount = courses.filter((c) => c.status === "current").length;
  const previousCount = courses.filter((c) => c.status === "previously_taught").length;
  const levelTypesCount = new Set(courses.map((c) => c.level).filter(Boolean)).size;

  const dynamicStats: TeachingStatItem[] = [
    {
      value: totalCount > 0 ? String(totalCount) : "0",
      label: "Total Courses",
      description: "Taught across undergraduate and postgraduate curricula",
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      value: String(currentCount),
      label: "Current Courses",
      description: "Active courses offered in the current semester",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: String(previousCount),
      label: "Previously Taught",
      description: "Past academic courses and completed lecture series",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: levelTypesCount > 0 ? `${levelTypesCount} Levels` : "All Levels",
      label: "Academic Levels",
      description: "Undergraduate, Graduate & Doctoral instruction",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Background Decorative Ambient Orbs */}
      <div
        className="absolute top-1/3 left-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-16 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Academic Instruction"
          title="Teaching Experience"
          description="Courses taught across undergraduate and postgraduate programs."
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
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-20" />
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-16" />
                </div>
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/2" />
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
            <Button variant="outline" size="sm" onClick={fetchTeachings} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedCourses.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-blue-400 flex items-center justify-center mx-auto text-xl font-bold">
              📚
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Teaching Courses Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Teaching course records will be added soon. Please check back later.
            </p>
          </div>
        )}

        {/* Responsive Grid of Course Cards */}
        {!isLoading && !error && displayedCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCourses.map((course) => {
              const code = course.course_code || course.code;
              const title = course.course_name || course.title;
              const year = course.academic_year || course.year;
              const isCurrent = course.status === "current";

              return (
                <Card
                  key={course.id}
                  variant="default"
                  hover
                  className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
                >
                  <div>
                    {/* Top Header: Code, Level, & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {code && (
                          <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-md border border-blue-200/60 dark:border-blue-900/50">
                            {code}
                          </span>
                        )}
                        {course.level && (
                          <Badge variant={getLevelBadgeVariant(course.level)} size="sm">
                            {course.level}
                          </Badge>
                        )}
                      </div>

                      <Badge
                        variant={isCurrent ? "success" : "outline"}
                        size="sm"
                        className="font-medium text-[11px]"
                        icon={
                          isCurrent ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ) : undefined
                        }
                      >
                        {isCurrent ? "Current" : "Previously Taught"}
                      </Badge>
                    </div>

                    {/* Course Name */}
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug">
                        {title}
                      </CardTitle>
                    </CardHeader>

                    {/* Description */}
                    <CardContent className="p-0">
                      <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
                        {course.description || "Course details will be added soon."}
                      </CardDescription>
                    </CardContent>
                  </div>

                  {/* Card Footer: Semester & Academic Year */}
                  {(course.semester || year) && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {course.semester ? (
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <svg className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {course.semester} Term
                        </span>
                      ) : <span />}

                      {year && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                          AY {year}
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        {showViewAll && !isLoading && !error && courses.length > 0 && (
          <div className="flex justify-center pt-6">
            <Link
              href="/teaching"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>View All Teaching</span>

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
        {/* Teaching Statistics Section Below Cards */}
        <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
              Teaching Impact & Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cumulative metrics across faculty instruction and thesis supervision
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all duration-300">
                    {stat.icon}
                  </div>
                  <Badge variant="outline" size="sm" className="text-[10px] font-bold uppercase">
                    Metric
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
