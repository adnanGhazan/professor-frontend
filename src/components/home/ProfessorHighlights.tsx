"use client";

import React, { useEffect, useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ExperienceService } from "@/src/services/experience.service";
import { ResearchProjectService } from "@/src/services/research-project.service";
import { StudentService } from "@/src/services/student.service";
import { AwardService } from "@/src/services/award.service";

export interface ResearchInterestItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface HighlightProfileItem {
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  badgeText: string;
}

export interface QuickFactItem {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface ProfessorHighlightsProps {
  className?: string;
}

export const ProfessorHighlights: React.FC<ProfessorHighlightsProps> = ({
  className = "",
}) => {
  const [metrics, setMetrics] = useState({
    experienceYears: 15,
    researchProjectsCount: 30,
    graduatedStudentsCount: 0,
    awardsCount: 12,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      const [expResult, projectsResult, studentsResult, awardsResult] = await Promise.allSettled([
        ExperienceService.getExperiences(),
        ResearchProjectService.getPublicResearchProjects(),
        StudentService.getPublicStudents(),
        AwardService.getPublicAwards(),
      ]);

      let expYears = 15;
      if (expResult.status === "fulfilled" && Array.isArray(expResult.value) && expResult.value.length > 0) {
        const currentYear = new Date().getFullYear();
        const startYears: number[] = [];

        expResult.value.forEach((item: any) => {
          let year: number | null = null;
          if (item.start_year != null && item.start_year !== "") {
            const parsed = parseInt(String(item.start_year).substring(0, 4), 10);
            if (!isNaN(parsed) && parsed > 1900 && parsed <= currentYear) {
              year = parsed;
            }
          }
          if (!year && item.start_date != null && item.start_date !== "") {
            const parsed = parseInt(String(item.start_date).substring(0, 4), 10);
            if (!isNaN(parsed) && parsed > 1900 && parsed <= currentYear) {
              year = parsed;
            }
          }
          if (!year && item.period) {
            const match = String(item.period).match(/\b(19\d{2}|20\d{2})\b/);
            if (match) {
              const parsed = parseInt(match[0], 10);
              if (!isNaN(parsed) && parsed > 1900 && parsed <= currentYear) {
                year = parsed;
              }
            }
          }
          if (year) {
            startYears.push(year);
          }
        });

        if (startYears.length > 0) {
          const minYear = Math.min(...startYears);
          const total = currentYear - minYear;
          if (total >= 0) {
            expYears = total;
          }
        }
      }

      let projCount = 30;
      if (projectsResult.status === "fulfilled" && Array.isArray(projectsResult.value)) {
        projCount = projectsResult.value.length;
      }

      let gradCount = 0;
      if (studentsResult.status === "fulfilled" && studentsResult.value) {
        let studentList: any[] = [];
        if (Array.isArray(studentsResult.value)) {
          studentList = studentsResult.value;
        } else if (typeof studentsResult.value === "object" && Array.isArray((studentsResult.value as any).items)) {
          studentList = (studentsResult.value as any).items;
        } else if (typeof studentsResult.value === "object" && Array.isArray((studentsResult.value as any).data)) {
          studentList = (studentsResult.value as any).data;
        }

        gradCount = studentList.filter((s) => {
          const status = s?.status ? String(s.status).toLowerCase().trim() : "";
          const isCompletedStatus =
            status === "completed" ||
            status === "graduated" ||
            status === "alumni" ||
            status === "alumnus" ||
            status === "passed" ||
            status === "former";

          const isNotCurrent = status !== "current" && status !== "active" && status !== "ongoing";
          const hasCompletionYear = s?.completion_year != null && Number(s.completion_year) > 0;
          const isGradFlag = Boolean(s?.is_graduated || s?.is_completed);

          return isCompletedStatus || isGradFlag || (isNotCurrent && (hasCompletionYear || status !== ""));
        }).length;
      }

      let awardCount = 12;
      if (awardsResult.status === "fulfilled" && Array.isArray(awardsResult.value)) {
        awardCount = awardsResult.value.length;
      }

      if (isMounted) {
        setMetrics({
          experienceYears: expYears,
          researchProjectsCount: projCount,
          graduatedStudentsCount: gradCount,
          awardsCount: awardCount,
        });
      }
    };

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  // SECTION 1: Research Interests Data (6 requested domains)
  const researchInterests: ResearchInterestItem[] = [
    {
      title: "Artificial Intelligence",
      description:
        "Autonomous agents, multi-agent systems, and decision-making frameworks under uncertainty.",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: "Machine Learning",
      description:
        "Supervised, unsupervised, and reinforcement learning algorithm design and optimization.",
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Deep Learning",
      description:
        "Transformer architectures, deep neural networks, and self-supervised representation learning.",
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Computer Vision",
      description:
        "Object detection, 3D scene reconstruction, video processing, and visual reasoning.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Natural Language Processing",
      description:
        "Large language models (LLMs), computational linguistics, and semantic search systems.",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: "Cyber Security",
      description:
        "Cryptographic protocols, system vulnerability identification, and privacy-preserving ML.",
      icon: (
        <svg className="w-6 h-6 text-rose-600 dark:text-rose-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  // SECTION 2: Academic Profiles Data (5 requested platforms)
  const academicProfiles: HighlightProfileItem[] = [
    {
      name: "Google Scholar",
      description:
        "Comprehensive index of citations, h-index tracking, and peer-reviewed scholarly publications.",
      url: "https://scholar.google.com",
      badgeText: "Citations & Metrics",
      icon: (
        <svg className="w-6 h-6 fill-current text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
          <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l12 9.5 12-9.5L12 0zm-8.4 12v3.6L12 21.6l8.4-6V12L12 18.6 3.6 12z" />
        </svg>
      ),
    },
    {
      name: "Scopus",
      description:
        "Elsevier abstract and citation database tracking authoritative peer-reviewed scientific literature.",
      url: "https://www.scopus.com",
      badgeText: "Author ID",
      icon: (
        <svg className="w-6 h-6 fill-current text-amber-600 dark:text-amber-400" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 7h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3h-2v-6h2v1.1c.37-.63 1.05-1.1 1.83-1.1 1.19 0 2.17.98 2.17 2.17V17z" />
        </svg>
      ),
    },
    {
      name: "ResearchGate",
      description:
        "Professional network for researchers to share papers, collaborate, and track scientific impact.",
      url: "https://www.researchgate.net",
      badgeText: "RG Score",
      icon: (
        <svg className="w-6 h-6 fill-current text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24">
          <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472H4.46C3.104 24 2 22.896 2 21.528V2.472C2 1.104 3.104 0 4.46 0h15.08zM17.5 13.5h-3.2v-2.1h3.2c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-5.2v10.1h2v-3.5h3.2c1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5h-7.2v10.1h2V7.4h5.2c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5z" />
        </svg>
      ),
    },
    {
      name: "ORCID",
      description:
        "Persistent digital identifier distinguishing research contributions across global repositories.",
      url: "https://orcid.org",
      badgeText: "ORCID iD",
      icon: (
        <svg className="w-6 h-6 fill-current text-teal-600 dark:text-teal-400" viewBox="0 0 24 24">
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.516.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.434h2.238c2.438 0 3.825-1.5 3.825-3.713 0-2.053-1.256-3.721-3.713-3.721h-2.35z" />
        </svg>
      ),
    },
    {
      name: "DBLP",
      description:
        "Computer science bibliography database listing open-access computer science publications.",
      url: "https://dblp.org",
      badgeText: "CS Bibliography",
      icon: (
        <svg className="w-6 h-6 fill-current text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24">
          <path d="M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm2 3v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z" />
        </svg>
      ),
    },
  ];

  // SECTION 3: Quick Facts Data (4 animated statistics cards)
  const quickFacts: QuickFactItem[] = [
    {
      title: "Experience",
      value: `${metrics.experienceYears}+ Years`,
      description: "Academic research leadership and university faculty tenure",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Research Projects",
      value: `${metrics.researchProjectsCount}+ Projects`,
      description: "Funded grants by NSF, IEEE, and leading industrial sponsors",
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.594 15.12a2 2 0 00-1.464.305l-1.071.714a2 2 0 00-.819 1.95l.484 2.906A2 2 0 004.693 23h14.614a2 2 0 001.969-1.605l.484-2.906a2 2 0 00-.819-1.95l-1.071-.714z" />
        </svg>
      ),
    },
    {
      title: "Graduated Students",
      value: metrics.graduatedStudentsCount === 1 ? "1 Scholar" : `${metrics.graduatedStudentsCount} Scholars`,
      description: "Mentored Ph.D. alumni and Master's thesis researchers",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Awards",
      value: `${metrics.awardsCount} Honors`,
      description: "Prestigious national & international scientific achievements",
      icon: (
        <svg className="w-6 h-6 text-rose-600 dark:text-rose-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-20">
        {/* SECTION 1: Research Interests */}
        <div className="space-y-10">
          <SectionHeading
            eyebrow="Specialized Domains"
            title="Research Interests"
            description="Core computer science and artificial intelligence research pillars driving laboratory investigations."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchInterests.map((item) => (
              <Card
                key={item.title}
                variant="default"
                hover
                className="group relative p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all duration-300">
                      {item.icon}
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 2: Academic Profiles */}
        <div className="space-y-10 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
          <SectionHeading
            eyebrow="Scholarly Indexing"
            title="Academic Profiles"
            description="Verified digital identifiers and bibliographic databases tracking publications and citation metrics."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {academicProfiles.map((profile) => (
              <a
                key={profile.name}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
                      {profile.icon}
                    </div>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      {profile.badgeText}
                    </Badge>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                    {profile.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-400">
                  <span>Visit Profile</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SECTION 3: Quick Facts (4 Animated Cards) */}
        <div className="space-y-10 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
          <SectionHeading
            eyebrow="Key Metrics"
            title="Quick Facts"
            description="Overview of faculty experience, research grants, student mentorship, and academic recognitions."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickFacts.map((fact) => (
              <div
                key={fact.title}
                className="group relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all duration-300">
                    {fact.icon}
                  </div>
                  <Badge variant="primary" size="sm" className="text-[10px] uppercase font-bold">
                    Stat
                  </Badge>
                </div>

                <span className="block text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {fact.value}
                </span>

                <h4 className="mt-1 text-sm font-bold text-blue-900 dark:text-blue-400 font-sans">
                  {fact.title}
                </h4>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {fact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
