import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export interface CourseItem {
  id: string;
  name: string;
  code: string;
  level: "BS" | "MS" | "PhD";
  semester: string;
  academicYear: string;
  status: "Current" | "Previously Taught";
  description: string;
}

export interface TeachingStatItem {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface TeachingExperienceProps {
  courses?: CourseItem[];
  stats?: TeachingStatItem[];
  className?: string;
}

export const TeachingExperience: React.FC<TeachingExperienceProps> = ({
  courses = [
    {
      id: "course-1",
      name: "Advanced Deep Learning & Generative Models",
      code: "CS 8803",
      level: "PhD",
      semester: "Fall",
      academicYear: "2024-2025",
      status: "Current",
      description:
        "Doctoral seminar covering transformer architectures, diffusion models, implicit neural representations, and mathematical foundations of deep learning.",
    },
    {
      id: "course-2",
      name: "Artificial Intelligence & Knowledge Representation",
      code: "CS 6601",
      level: "MS",
      semester: "Spring",
      academicYear: "2023-2024",
      status: "Previously Taught",
      description:
        "Graduate-level coverage of heuristic search, automated theorem proving, probabilistic graphical models, and multi-agent coordination.",
    },
    {
      id: "course-3",
      name: "Data Structures & Algorithms",
      code: "CS 2110",
      level: "BS",
      semester: "Fall",
      academicYear: "2024-2025",
      status: "Current",
      description:
        "Fundamental undergraduate curriculum on asymptotic complexity analysis, balanced search trees, graph algorithms, and dynamic programming.",
    },
    {
      id: "course-4",
      name: "Machine Learning Systems & Infrastructure",
      code: "CS 7643",
      level: "MS",
      semester: "Spring",
      academicYear: "2023-2024",
      status: "Previously Taught",
      description:
        "Engineering distributed machine learning pipelines, GPU memory optimization, model quantization, and scalable cloud deployment.",
    },
    {
      id: "course-5",
      name: "Ethical AI, Safety & Governance",
      code: "CS 4803",
      level: "BS",
      semester: "Fall",
      academicYear: "2023-2024",
      status: "Previously Taught",
      description:
        "Undergraduate seminar examining algorithmic fairness, explainability (XAI), data privacy frameworks, and ethical AI design principles.",
    },
    {
      id: "course-6",
      name: "Foundations of Computer Vision",
      code: "CS 7495",
      level: "PhD",
      semester: "Spring",
      academicYear: "2022-2023",
      status: "Previously Taught",
      description:
        "Advanced research in 3D geometry reconstruction, optical flow, neural radiance fields (NeRFs), and multimodal vision-language models.",
    },
  ],
  stats = [
    {
      value: "15+ Years",
      label: "Years Teaching",
      description: "Dedicated university instruction & faculty tenure",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: "50+ Courses",
      label: "Courses Delivered",
      description: "Across undergraduate and postgraduate curricula",
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      value: "2,500+",
      label: "Students Taught",
      description: "Students instructed across lectures & laboratory sessions",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: "35+",
      label: "MS/PhD Supervised",
      description: "Graduate thesis & doctoral dissertation supervisions",
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.594 15.12a2 2 0 00-1.464.305l-1.071.714a2 2 0 00-.819 1.95l.484 2.906A2 2 0 004.693 23h14.614a2 2 0 001.969-1.605l.484-2.906a2 2 0 00-.819-1.95l-1.071-.714z" />
        </svg>
      ),
    },
  ],
  className = "",
}) => {
  const getLevelBadgeVariant = (level: CourseItem["level"]) => {
    switch (level) {
      case "PhD":
        return "accent";
      case "MS":
        return "primary";
      case "BS":
        return "secondary";
      default:
        return "default";
    }
  };

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

      <div className="relative z-10 space-y-16">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Academic Instruction"
          title="Teaching Experience"
          description="Courses taught across undergraduate and postgraduate programs."
          align="center"
        />

        {/* Responsive Grid of 6 Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              variant="default"
              hover
              className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
            >
              <div>
                {/* Top Header: Code, Level, & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-md border border-blue-200/60 dark:border-blue-900/50">
                      {course.code}
                    </span>
                    <Badge variant={getLevelBadgeVariant(course.level)} size="sm">
                      {course.level} Level
                    </Badge>
                  </div>

                  <Badge
                    variant={course.status === "Current" ? "success" : "outline"}
                    size="sm"
                    className="font-medium text-[11px]"
                    icon={
                      course.status === "Current" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ) : undefined
                    }
                  >
                    {course.status}
                  </Badge>
                </div>

                {/* Course Name */}
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug">
                    {course.name}
                  </CardTitle>
                </CardHeader>

                {/* Short Description */}
                <CardContent className="p-0">
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {course.description}
                  </CardDescription>
                </CardContent>
              </div>

              {/* Card Footer: Semester & Academic Year */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <svg className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {course.semester} Term
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  AY {course.academicYear}
                </span>
              </div>
            </Card>
          ))}
        </div>

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
