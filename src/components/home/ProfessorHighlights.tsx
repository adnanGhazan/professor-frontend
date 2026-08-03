import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { AcademicProfiles } from "./AcademicProfiles";

export interface ResearchInterest {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

export interface TimelineEvent {
  year: string;
  role: string;
  institution: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}

export interface ProfessorHighlightsProps {
  researchInterests?: ResearchInterest[];
  academicExpertise?: string[];
  timeline?: TimelineEvent[];
  stats?: StatItem[];
  googleScholarUrl?: string;
  scopusUrl?: string;
  orcidUrl?: string;
  researchGateUrl?: string;
  className?: string;
}

export const ProfessorHighlights: React.FC<ProfessorHighlightsProps> = ({
  researchInterests = [
    {
      title: "Deep Learning & Neural Architectures",
      description:
        "Developing scalable foundation models, transformer efficiency, and self-supervised learning representations.",
      tags: ["Transformers", "Self-Supervised", "Model Scaling"],
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Automated Reasoning & Verification",
      description:
        "Formal methods, automated theorem proving, and safety verification for critical AI autonomous systems.",
      tags: ["Formal Methods", "Theorem Proving", "AI Safety"],
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Ethical AI & Governance",
      description:
        "Algorithmic fairness, explainability (XAI), privacy-preserving machine learning, and AI regulatory policy.",
      tags: ["XAI", "Fairness", "Privacy-Preserving"],
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      title: "Bioinformatics & Health AI",
      description:
        "Applying multimodal AI to genomic analysis, drug discovery, and predictive clinical diagnostic systems.",
      tags: ["Genomics", "Clinical AI", "Drug Discovery"],
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.594 15.12a2 2 0 00-1.464.305l-1.071.714a2 2 0 00-.819 1.95l.484 2.906A2 2 0 004.693 23h14.614a2 2 0 001.969-1.605l.484-2.906a2 2 0 00-.819-1.95l-1.071-.714z" />
        </svg>
      ),
    },
  ],
  academicExpertise = [
    "Machine Learning & Deep Neural Nets",
    "Computer Vision & Pattern Recognition",
    "Natural Language Processing (NLP)",
    "Reinforcement Learning",
    "Graph Neural Networks (GNNs)",
    "Distributed Systems & HPC",
    "AI Governance & Policy",
    "Algorithmic Complexity",
  ],
  timeline = [
    {
      year: "2021 — Present",
      role: "Full Professor & Chair of AI",
      institution: "Department of Computer Science & AI Research Center",
      description:
        "Leading university AI research initiatives, directing doctoral scholars, and securing major competitive grants.",
    },
    {
      year: "2016 — 2021",
      role: "Associate Professor",
      institution: "School of Engineering & Applied Sciences",
      description:
        "Spearheaded multi-institutional research on trustworthy neural networks and automated verification.",
    },
    {
      year: "2012 — 2016",
      role: "Assistant Professor & Research Fellow",
      institution: "Institute for Advanced Computational Science",
      description:
        "Established the AI Safety & Systems Laboratory and published seminal work on model interpretability.",
    },
    {
      year: "2008 — 2012",
      role: "Ph.D. in Computer Science",
      institution: "Graduate School of Engineering",
      description:
        "Dissertation focused on scalable machine learning algorithms and neural network optimization.",
    },
  ],
  stats = [
    {
      label: "Total Citations",
      value: "12,450+",
      change: "+1,200 this year",
      icon: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: "h-index",
      value: "48",
      change: "Top 2% Globally",
      icon: (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "i10-index",
      value: "112",
      change: "112 High-Impact Papers",
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      label: "Research Funding",
      value: "$4.8M+",
      change: "NSF & Industry Grants",
      icon: (
        <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ],
  googleScholarUrl,
  scopusUrl,
  orcidUrl,
  researchGateUrl,
  className = "",
}) => {
  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-16">
        {/* Section Header */}
        <SectionHeading
          eyebrow="Academic Highlights"
          title="Scholarly Impact & Focus Areas"
          description="Overview of research domain specializations, citation metrics, scholarly indices, and academic career trajectory."
          align="center"
        />

        {/* 1. Four Animated Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                {stat.change && (
                  <Badge variant="outline" size="sm" className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {stat.change}
                  </Badge>
                )}
              </div>

              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {stat.value}
              </span>
              <span className="block mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* 2. Academic Profiles Bar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Scholarly Indexing & Profiles
          </h3>
          <AcademicProfiles
            googleScholarUrl={googleScholarUrl}
            scopusUrl={scopusUrl}
            orcidUrl={orcidUrl}
            researchGateUrl={researchGateUrl}
          />
        </div>

        {/* 3. Research Interests & Academic Expertise Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Research Interests (Left Column 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                Research Focus & Domains
              </h3>
              <Badge variant="primary" size="sm">
                4 Key Pillars
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {researchInterests.map((interest) => (
                <Card
                  key={interest.title}
                  variant="default"
                  hover
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between"
                >
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                        {interest.icon}
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {interest.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {interest.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 pt-3 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                    {interest.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Academic Expertise Tags (Right Column 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
              Core Academic Expertise
            </h3>

            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Specialized technical domains and interdisciplinary areas of research expertise:
              </p>

              <div className="flex flex-wrap gap-2">
                {academicExpertise.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors duration-150 cursor-default"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mr-2 shrink-0"></span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Academic Career Timeline Preview */}
        <div className="space-y-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                Academic & Professional Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Faculty appointments, research leadership, and academic milestones
              </p>
            </div>
            <Badge variant="accent" size="md">
              Career Trajectory
            </Badge>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
            {timeline.map((event) => (
              <div key={event.year + event.role} className="relative group">
                {/* Bullet node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-900 dark:bg-blue-500 group-hover:scale-125 transition-transform duration-200" />

                <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs group-hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider font-mono">
                      {event.year}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {event.institution}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                    {event.role}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
