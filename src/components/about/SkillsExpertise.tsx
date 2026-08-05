import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Badge } from "../ui/badge";

export interface SkillCategory {
  title: string;
  skills: string[];
  color: string;
}

export interface SkillsExpertiseProps {
  categories?: SkillCategory[];
  className?: string;
}

export const SkillsExpertise: React.FC<SkillsExpertiseProps> = ({
  categories = [
    {
      title: "Core Research Domains",
      color: "blue",
      skills: [
        "Deep Learning & Foundation Models",
        "Automated Neural Verification",
        "Computer Vision & 3D Spatial AI",
        "Natural Language Processing (LLMs)",
        "Privacy-Preserving Machine Learning",
        "Reinforcement Learning & Robotics",
        "Explainable AI (XAI) & Governance",
        "Graph Neural Networks (GNNs)",
      ],
    },
    {
      title: "Tools, Frameworks & Languages",
      color: "amber",
      skills: [
        "PyTorch & PyTorch Geometric",
        "TensorFlow & JAX",
        "C++ / CUDA Acceleration",
        "Python / Scientific Computing",
        "Z3 SMT Solver & Formal Verifiers",
        "ROS 2 & Robotics Middleware",
        "Docker & Kubernetes Clusters",
        "Git & CI/CD Pipelines",
      ],
    },
    {
      title: "Academic Leadership & Service",
      color: "emerald",
      skills: [
        "NSF & DARPA Grant Writing",
        "Doctoral Thesis Supervision",
        "Journal & Conference Editing",
        "Curriculum & Course Design",
        "Conference Program Chairing",
        "University Faculty Governance",
        "Ethical AI Advisory Boards",
        "Peer Reviewing (TPAMI/NeurIPS/CVPR)",
      ],
    },
  ],
  className = "",
}) => {
  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Competencies & Leadership"
          title="Skills / Expertise"
          description="Technical proficiencies, specialized methodologies, and academic leadership skills."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
                  {cat.title}
                </h3>
                <Badge variant="primary" size="sm">
                  {cat.skills.length} Areas
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors duration-150 cursor-default"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mr-2 shrink-0" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
