import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export interface AwardItem {
  id: string;
  name: string;
  organization: string;
  year: string;
  category: string;
  description: string;
  isFeatured?: boolean;
}

export interface AchievementStatItem {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface AwardsHonorsProps {
  featuredAward?: AwardItem;
  awards?: AwardItem[];
  stats?: AchievementStatItem[];
  className?: string;
}

export const AwardsHonors: React.FC<AwardsHonorsProps> = ({
  featuredAward = {
    id: "featured-1",
    name: "IEEE Fellow Designation for Contributions to Trustworthy AI & Neural Verification",
    organization: "Institute of Electrical and Electronics Engineers (IEEE)",
    year: "2024",
    category: "Lifetime International Honor",
    description:
      "Conferred for pioneering scientific contributions to the formal verification of deep neural networks, model interpretability, and leadership in ethical artificial intelligence research.",
    isFeatured: true,
  },
  awards = [
    {
      id: "award-1",
      name: "ACM Distinguished Scientist Award",
      organization: "Association for Computing Machinery (ACM)",
      year: "2023",
      category: "Research Excellence",
      description:
        "Recognizing significant impact and sustained scientific contributions to computer science and artificial intelligence.",
    },
    {
      id: "award-2",
      name: "NSF CAREER Award",
      organization: "National Science Foundation",
      year: "2021",
      category: "National Research Honor",
      description:
        "Prestigious early-career faculty award supporting foundational research on privacy-preserving machine learning.",
    },
    {
      id: "award-3",
      name: "Best Paper Award (CVPR 2023)",
      organization: "IEEE/CVF CVPR Conference Committee",
      year: "2023",
      category: "Best Paper Award",
      description:
        "Awarded for the publication 'Transformer-Based Multimodal Reasoning for Complex 3D Scene Reconstruction'.",
    },
    {
      id: "award-4",
      name: "Presidential Excellence in University Teaching",
      organization: "University Academic Senate",
      year: "2022",
      category: "Teaching Award",
      description:
        "Highest university recognition for innovative computer science pedagogy, curriculum design, and doctoral mentorship.",
    },
    {
      id: "award-5",
      name: "Google Research Faculty Award",
      organization: "Google AI Research Office",
      year: "2022",
      category: "Industry Research Award",
      description:
        "Unrestricted research grant for automated software vulnerability detection using neural Transformer models.",
    },
    {
      id: "award-6",
      name: "Outstanding Doctoral Dissertation Advisor",
      organization: "Graduate School of Engineering",
      year: "2023",
      category: "Mentorship Award",
      description:
        "Recognizing exceptional dedication in supervising and placing doctoral graduates in top academic and research labs.",
    },
    {
      id: "award-7",
      name: "ACM SIGPLAN Distinguished Paper Award",
      organization: "ACM PLDI Conference Committee",
      year: "2023",
      category: "Best Paper Award",
      description:
        "Awarded for groundbreaking work on formal verification of safety-critical autonomous neural controllers.",
    },
    {
      id: "award-8",
      name: "International AI Leadership Medal",
      organization: "International AI Association",
      year: "2020",
      category: "Service & Leadership",
      description:
        "Honoring leadership as Program Chair for international artificial intelligence conferences and policy boards.",
    },
  ],
  stats = [
    {
      value: "16",
      label: "Awards Received",
      description: "Total academic recognitions & honors",
      icon: (
        <svg className="w-6 h-6 text-amber-500 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      ),
    },
    {
      value: "9",
      label: "International Awards",
      description: "Conferred by global scientific societies",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      value: "7",
      label: "National Awards",
      description: "National foundation & university honors",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      value: "12",
      label: "Research Grants",
      description: "Competitive funded research proposals",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ],
  className = "",
}) => {
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

      <div className="relative z-10 space-y-16">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Recognitions & Achievements"
          title="Awards & Honors"
          description="Recognition received for excellence in research, teaching, and academic service."
          align="center"
        />

        {/* Featured Top Award Hero Card */}
        {featuredAward && (
          <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/10 via-blue-900/10 to-amber-500/10 dark:from-amber-400/15 dark:via-blue-950/40 dark:to-amber-400/15 p-1">
            <div className="rounded-[23px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-300/60 dark:border-amber-700/60 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  {/* Trophy Emblem */}
                  <div className="p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-400/20 border border-amber-400/30 shrink-0 text-amber-600 dark:text-amber-400">
                    <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H8v2h8v-2h-3v-2.1c2.16-.4 3.86-2.1 4.39-4.34C19.8 11.23 21 9.25 21 7V6c0-1.1-.9-1-2-1zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent" size="md" className="font-bold">
                        ★ {featuredAward.category}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        {featuredAward.year}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-tight">
                      {featuredAward.name}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-400">
                      {featuredAward.organization}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal pt-1 max-w-3xl">
                      {featuredAward.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid of 8 Award Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {awards.map((award) => (
            <Card
              key={award.id}
              variant="default"
              hover
              className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500"
            >
              <div>
                {/* Header: Year & Category Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge variant="outline" size="sm" className="font-semibold text-[11px]">
                    {award.category}
                  </Badge>

                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {award.year}
                  </span>
                </div>

                {/* Medal Icon & Title */}
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 shrink-0 border border-amber-200/60 dark:border-amber-900/50">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.93V17h-2v-.07A7.001 7.001 0 015.07 12H5v-2h.07A7.001 7.001 0 0111 5.07V5h2v.07A7.001 7.001 0 0118.93 10H19v2h-.07A7.001 7.001 0 0113 16.93z" />
                      </svg>
                    </div>

                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                      {award.name}
                    </CardTitle>
                  </div>

                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-400">
                    {award.organization}
                  </p>
                </CardHeader>

                {/* Short Description */}
                <CardContent className="p-0 pt-1">
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {award.description}
                  </CardDescription>
                </CardContent>
              </div>

              {/* Timeline Indicator */}
              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Honors & Recognitions</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">★ Conferred</span>
              </div>
            </Card>
          ))}
        </div>

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
            {stats.map((stat) => (
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
