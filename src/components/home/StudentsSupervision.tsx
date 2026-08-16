"use client";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { Student } from "@/src/types/student";
import { StudentService } from "@/src/services/student.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface SupervisionStatItem {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface StudentsSupervisionProps {
  stats?: SupervisionStatItem[];
  className?: string;
  showViewAll?: boolean;
}
export const StudentsSupervision: React.FC<StudentsSupervisionProps> = ({
  stats: statsProp,
  className = "",
  showViewAll = true,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"ALL" | "phd" | "ms" | "bs">("ALL");

  // Fetch Public Students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await StudentService.getPublicStudents();
      setStudents(data);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to load public student records:", err);
      setError("Unable to load student supervision records at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Helper to determine category from degree text
  const getStudentCategory = (degreeStr?: string | null): "phd" | "ms" | "bs" | "other" => {
    if (!degreeStr) return "other";
    const d = degreeStr.toUpperCase();
    if (d.includes("PHD") || d.includes("DOCTOR") || d.includes("DPHIL")) return "phd";
    if (d.includes("MS") || d.includes("MPHIL") || d.includes("MASTER")) return "ms";
    if (d.includes("BS") || d.includes("BACHELOR") || d.includes("FINAL YEAR PROJECT")) return "bs";
    return "other";
  };

  // Helper to check if a student has completed/graduated status
  const isCompletedStudent = (s: Student) => {
    const st = s.status ? String(s.status).toLowerCase().trim() : "";
    return (
      st === "completed" ||
      st === "graduated" ||
      st === "alumni" ||
      st === "alumnus" ||
      st === "passed" ||
      st === "former" ||
      (st !== "current" && st !== "active" && st !== "ongoing" && (s.completion_year != null || st !== ""))
    );
  };

  // Helper to check if a student has current/active status
  const isCurrentStudent = (s: Student) => {
    const st = s.status ? String(s.status).toLowerCase().trim() : "";
    return st === "current" || st === "active" || st === "ongoing" || (!st && s.completion_year == null);
  };

  // Dynamic Supervision Overview & Impact Counts from API Records
  const phdCount = students.filter((s) => getStudentCategory(s.degree) === "phd" && isCompletedStudent(s)).length;
  const msCount = students.filter((s) => getStudentCategory(s.degree) === "ms" && isCompletedStudent(s)).length;
  const bsCount = students.filter((s) => getStudentCategory(s.degree) === "bs" && isCompletedStudent(s)).length;
  const currentResearchersCount = students.filter((s) => isCurrentStudent(s)).length;

  const defaultStats: SupervisionStatItem[] = [
    {
      value: String(phdCount),
      label: "PhD Supervised",
      description: "Doctoral scholars mentored & dissertations chaired",
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
    },
    {
      value: String(msCount),
      label: "MS Supervised",
      description: "Master's thesis graduates mentored in AI research",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      value: String(bsCount),
      label: "BS Projects",
      description: "Undergraduate senior capstone research projects",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: String(currentResearchersCount),
      label: "Current Researchers",
      description: "Active doctoral, master's & undergraduate researchers",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const overviewStats = statsProp || defaultStats;

  // Extract initials for fallback avatar
  const getInitials = (name?: string | null) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Format Timeline string
  const formatTimeline = (student: Student) => {
    const isCurrent = student.status === "current";
    if (isCurrent) {
      return student.start_year ? `${student.start_year} — Present` : "Present";
    }
    if (student.start_year && student.completion_year) {
      return `${student.start_year} — ${student.completion_year}`;
    }
    return student.completion_year ? String(student.completion_year) : "Graduated";
  };

  // Dynamic Tab Counts from API Records
  const categories = [
    { key: "ALL", label: "All Researchers", count: students.length },
    { key: "phd", label: "PhD Students", count: students.filter((s) => getStudentCategory(s.degree) === "phd").length },
    { key: "ms", label: "MS Students", count: students.filter((s) => getStudentCategory(s.degree) === "ms").length },
    { key: "bs", label: "BS Final Year Projects", count: students.filter((s) => getStudentCategory(s.degree) === "bs").length },
  ];

  // Filter students based on active tab and limit to first 6 visible
  const filteredStudents = (
    activeTab === "ALL"
      ? students
      : students.filter((s) => getStudentCategory(s.degree) === activeTab)
  ).slice(0, 6);

  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Ambient background decoration */}
      <div
        className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-16 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Research Lab & Mentorship"
          title="Students & Supervision"
          description="Mentoring undergraduate, postgraduate, and doctoral researchers."
          align="center"
        />

        {/* Category Filter Tabs */}
        {!isLoading && !error && students.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {categories.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 ${activeTab === tab.key
                  ? "bg-blue-900 text-white dark:bg-blue-600 shadow-md scale-105"
                  : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

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
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-16" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-2/3" />
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
            <Button variant="outline" size="sm" onClick={fetchStudents} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredStudents.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
              🎓
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Student Records Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab !== "ALL"
                ? "No student supervision records match this selected category."
                : "Student supervision records will be updated soon."}
            </p>
          </div>
        )}

        {/* Responsive Grid of Student Cards */}
        {!isLoading && !error && filteredStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudents.map((student) => {
              const cat = getStudentCategory(student.degree);
              const isCurrent = student.status === "current";

              return (
                <Card
                  key={student.id}
                  variant="default"
                  hover
                  className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
                >
                  <div>
                    {/* Header: Degree Tag & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <Badge
                        variant={
                          cat === "phd"
                            ? "accent"
                            : cat === "ms"
                              ? "primary"
                              : "secondary"
                        }
                        size="sm"
                        className="font-semibold"
                      >
                        {student.degree}
                      </Badge>

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
                        {isCurrent ? "Current" : "Graduated"}
                      </Badge>
                    </div>

                    {/* Student Avatar & Name */}
                    <CardHeader className="p-0 pb-3">
                      <div className="flex items-center gap-3 mb-1">
                        {/* Circular Image / Avatar with Initials Fallback */}
                        <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-900 to-slate-800 dark:from-blue-600 dark:to-slate-700 overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                          {student.photo_url && !failedImageIds[student.id] ? (
                            <img
                              src={student.photo_url}
                              alt={student.student_name}
                              className="h-full w-full object-cover"
                              onError={() => setFailedImageIds((prev) => ({ ...prev, [student.id]: true }))}
                            />
                          ) : (
                            <span>{getInitials(student.student_name)}</span>
                          )}
                        </div>

                        <div className="truncate">
                          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug truncate">
                            {student.student_name}
                          </CardTitle>
                          {student.institution && (
                            <span className="text-xs font-semibold text-blue-900 dark:text-blue-400 block truncate">
                              {student.institution}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Research Topic / Title */}
                    <CardContent className="p-0 pt-2 space-y-2">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Research Focus
                      </span>
                      <CardDescription className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic line-clamp-3">
                        &ldquo;{student.research_title || student.description || "Research topic details will be added soon."}&rdquo;
                      </CardDescription>
                    </CardContent>
                  </div>

                  {/* Card Footer: Timeline & Status */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Timeline:</span>
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {formatTimeline(student)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                        {isCurrent ? "● Active Researcher" : "✓ Graduated Alumni"}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {showViewAll && !isLoading && !error && students.length > 0 && (
          <div className="flex justify-center pt-6">
            <Link
              href="/students"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>View All Students</span>

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
        {/* Supervision Statistics Section Below Cards */}
        <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
              Supervision Overview & Impact
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cumulative metrics across doctoral dissertations, master theses, and capstone supervision
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all duration-300">
                    {stat.icon}
                  </div>
                  <Badge variant="outline" size="sm" className="text-[10px] font-bold uppercase">
                    Mentorship
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
