import React from "react";
import Link from "next/link";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  agency: string;
  status: "Ongoing" | "Completed";
  duration: string;
  budget: string;
  teamSize: string;
  technologies: string[];
  linkUrl?: string;
}

export interface ResearchProjectsProps {
  projects?: ProjectItem[];
  className?: string;
}

export const ResearchProjects: React.FC<ResearchProjectsProps> = ({
  projects = [
    {
      id: "proj-1",
      title: "Trustworthy & Provably Secure Autonomous AI Systems",
      description:
        "Developing formal verification algorithms and runtime monitoring tools for safety-critical autonomous vehicles and aerial systems.",
      agency: "National Science Foundation (NSF)",
      status: "Ongoing",
      duration: "2023 — 2026",
      budget: "$1,450,000",
      teamSize: "8 Researchers",
      technologies: ["PyTorch", "Z3 Solver", "ROS 2", "C++"],
    },
    {
      id: "proj-2",
      title: "Multimodal Large Language Models for Clinical Decision Support",
      description:
        "Building privacy-preserving diagnostic AI models for analyzing electronic health records, genomic sequences, and medical imaging.",
      agency: "National Institutes of Health (NIH)",
      status: "Ongoing",
      duration: "2024 — 2027",
      budget: "$2,100,000",
      teamSize: "12 Researchers",
      technologies: ["Transformers", "CUDA", "FHIR API", "Python"],
    },
    {
      id: "proj-3",
      title: "Energy-Efficient Deep Learning Architectures for Edge Computing",
      description:
        "Quantization and hardware-software co-design methods for executing neural networks on ultra-low-power embedded IoT devices.",
      agency: "DARPA Research Office",
      status: "Completed",
      duration: "2021 — 2024",
      budget: "$980,000",
      teamSize: "6 Researchers",
      technologies: ["TensorFlow Lite", "FPGA", "SystemVerilog", "C"],
    },
    {
      id: "proj-4",
      title: "Scalable Privacy-Preserving Federated Learning Protocols",
      description:
        "Differential privacy and secure multi-party computation algorithms for collaborative cross-institution machine learning networks.",
      agency: "European Research Council (ERC)",
      status: "Completed",
      duration: "2020 — 2023",
      budget: "$1,150,000",
      teamSize: "7 Researchers",
      technologies: ["OpenMined", "PySyft", "Docker", "Rust"],
    },
    {
      id: "proj-5",
      title: "AI-Driven Cyber Threat Intelligence & Automated Response",
      description:
        "Real-time graph neural network threat detection for enterprise networks and zero-day vulnerability prediction.",
      agency: "Department of Homeland Security (DHS)",
      status: "Ongoing",
      duration: "2023 — 2025",
      budget: "$890,000",
      teamSize: "5 Researchers",
      technologies: ["PyTorch Geometric", "eBPF", "Kafka", "Go"],
    },
    {
      id: "proj-6",
      title: "Automated Code Synthesis and Program Repair using Neural Transformers",
      description:
        "Deep learning models for automated software bug identification, security vulnerability patching, and code refactoring.",
      agency: "Google Research Faculty Award",
      status: "Completed",
      duration: "2022 — 2024",
      budget: "$650,000",
      teamSize: "4 Researchers",
      technologies: ["Tree-Sitter", "HuggingFace", "LLVM", "Python"],
    },
  ],
  className = "",
}) => {
  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Ambient background decoration */}
      <div
        className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-12">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Funded Initiatives"
          title="Research Projects"
          description="Ongoing and completed funded research projects."
          align="center"
        />

        {/* Responsive Grid of Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              variant="default"
              hover
              className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
            >
              <div>
                {/* Header: Status Badge & Duration */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge
                    variant={proj.status === "Ongoing" ? "success" : "secondary"}
                    size="sm"
                    className="font-semibold"
                    icon={
                      proj.status === "Ongoing" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ) : undefined
                    }
                  >
                    {proj.status}
                  </Badge>

                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {proj.duration}
                  </span>
                </div>

                {/* Title */}
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                    {proj.title}
                  </CardTitle>
                </CardHeader>

                {/* Funding Agency & Description */}
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-400">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 fill-current" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356.257l4 4a1 1 0 001.388 0l4-4a1 1 0 01.356-.257l2.644-1.131a1 1 0 000-1.84l-7-3z" />
                    </svg>
                    <span>{proj.agency}</span>
                  </div>

                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {proj.description}
                  </CardDescription>
                </CardContent>
              </div>

              {/* Metadata Details & Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                {/* Budget & Team Size */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-semibold">Budget</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{proj.budget}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-sans font-semibold">Team</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{proj.teamSize}</span>
                  </div>
                </div>

                {/* Technologies List */}
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" size="sm" className="text-[10px]">
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* View Details Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="justify-between text-blue-900 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 font-semibold"
                  rightIcon={
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Projects Button */}
        <div className="flex justify-center pt-6">
          <Link href="#projects" passHref>
            <Button
              variant="primary"
              size="lg"
              className="px-8 shadow-md"
              rightIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};
