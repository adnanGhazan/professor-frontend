"use client";
import React, { useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export interface StudentItem {
  id: string;
  name: string;
  degree: string;
  category: "PhD" | "MS" | "BS";
  topic: string;
  status: "Current" | "Graduated";
  graduationYear: string;
  coSupervisor?: string;
  avatarPlaceholder?: string;
}

export interface SupervisionStatItem {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface StudentsSupervisionProps {
  students?: StudentItem[];
  stats?: SupervisionStatItem[];
  className?: string;
}

export const StudentsSupervision: React.FC<StudentsSupervisionProps> = ({
  students = [
    // PhD Category
    {
      id: "phd-1",
      name: "David K. Miller",
      degree: "Ph.D. in Computer Science",
      category: "PhD",
      topic: "Verification & Safety Guarantees for Autonomous Deep Learning Systems",
      status: "Current",
      graduationYear: "2025 (Expected)",
      coSupervisor: "Dr. Elena Vance (MIT)",
    },
    {
      id: "phd-2",
      name: "Sophia L. Chen",
      degree: "Ph.D. in Artificial Intelligence",
      category: "PhD",
      topic: "Multimodal Large Language Models for Clinical Reasoning & Diagnosis",
      status: "Graduated",
      graduationYear: "2023",
      coSupervisor: "Prof. Robert Thorne",
    },
    {
      id: "phd-3",
      name: "Marcus A. Wright",
      degree: "Ph.D. in Computer Science",
      category: "PhD",
      topic: "Privacy-Preserving Federated Learning in Heterogeneous Networks",
      status: "Current",
      graduationYear: "2026 (Expected)",
      coSupervisor: "Dr. James Ross (Stanford)",
    },

    // MS Category
    {
      id: "ms-1",
      name: "Emily R. Watson",
      degree: "M.S. in Computer Science",
      category: "MS",
      topic: "Neural Network Quantization for Ultra-Low-Power Edge IoT Accelerators",
      status: "Graduated",
      graduationYear: "2024",
      coSupervisor: "Alan Turing Research Lab",
    },
    {
      id: "ms-2",
      name: "Tariq H. Al-Mansoor",
      degree: "M.S. in Artificial Intelligence",
      category: "MS",
      topic: "Graph Neural Networks for Zero-Day Vulnerability Detection in Smart Contracts",
      status: "Current",
      graduationYear: "2025 (Expected)",
      coSupervisor: "None",
    },
    {
      id: "ms-3",
      name: "Hannah M. Taylor",
      degree: "M.S. in Data Science",
      category: "MS",
      topic: "Explainable AI Frameworks for Automated Financial Fraud Detection",
      status: "Graduated",
      graduationYear: "2023",
      coSupervisor: "Dr. Sarah Gupta",
    },

    // BS Category
    {
      id: "bs-1",
      name: "Liam O'Connor & Maya Patel",
      degree: "B.S. in Computer Science (Capstone)",
      category: "BS",
      topic: "Real-Time Autonomous Drone Navigation using Lightweight Vision Transformers",
      status: "Graduated",
      graduationYear: "2024",
      coSupervisor: "None",
    },
    {
      id: "bs-2",
      name: "Alexander J. Kim",
      degree: "B.S. in Computer Engineering",
      category: "BS",
      topic: "Hardware Acceleration for Sparse Matrix Multiplication on FPGAs",
      status: "Current",
      graduationYear: "2025 (Expected)",
      coSupervisor: "Dr. Michael Scott",
    },
  ],
  stats = [
    {
      value: "14",
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
      value: "28",
      label: "MS Supervised",
      description: "Master's thesis graduates mentored in AI research",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      value: "40+",
      label: "BS Projects",
      description: "Undergraduate senior capstone research projects",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: "12",
      label: "Current Researchers",
      description: "Active doctoral, master's & undergraduate researchers",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ],
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "PhD" | "MS" | "BS">("ALL");

  const filteredStudents =
    activeTab === "ALL" ? students : students.filter((s) => s.category === activeTab);

  const categories = [
    { key: "ALL", label: "All Researchers", count: students.length },
    { key: "PhD", label: "PhD Students", count: students.filter((s) => s.category === "PhD").length },
    { key: "MS", label: "MS Students", count: students.filter((s) => s.category === "MS").length },
    { key: "BS", label: "BS Final Year Projects", count: students.filter((s) => s.category === "BS").length },
  ];

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

      <div className="relative z-10 space-y-16">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Research Lab & Mentorship"
          title="Students & Supervision"
          description="Mentoring undergraduate, postgraduate, and doctoral researchers."
          align="center"
        />

        {/* Category Filter Tabs */}
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

        {/* Responsive Grid of Student Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.map((student) => (
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
                      student.category === "PhD"
                        ? "accent"
                        : student.category === "MS"
                          ? "primary"
                          : "secondary"
                    }
                    size="sm"
                    className="font-semibold"
                  >
                    {student.category} Candidate
                  </Badge>

                  <Badge
                    variant={student.status === "Current" ? "success" : "outline"}
                    size="sm"
                    className="font-medium text-[11px]"
                    icon={
                      student.status === "Current" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ) : undefined
                    }
                  >
                    {student.status}
                  </Badge>
                </div>

                {/* Student Name & Degree */}
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-slate-800 dark:from-blue-600 dark:to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug">
                        {student.name}
                      </CardTitle>
                      <span className="text-xs font-semibold text-blue-900 dark:text-blue-400">
                        {student.degree}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {/* Research Topic */}
                <CardContent className="p-0 pt-2 space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Research Topic
                  </span>
                  <CardDescription className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                    &ldquo;{student.topic}&rdquo;
                  </CardDescription>
                </CardContent>
              </div>

              {/* Card Footer: Graduation Year & Co-supervisor */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Graduation:</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {student.graduationYear}
                  </span>
                </div>

                {student.coSupervisor && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Co-supervisor:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[170px]" title={student.coSupervisor}>
                      {student.coSupervisor}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

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
            {stats.map((stat) => (
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
