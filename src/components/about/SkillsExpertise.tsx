"use client";

import React, { useEffect, useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { SkillService } from "@/src/services/skill.service";
import { SkillCategory as CmsSkillCategory } from "@/src/types/skill";

export interface SkillCategoryDisplay {
  id?: number;
  title: string;
  skills: string[];
}

export interface SkillsExpertiseProps {
  initialCategories?: SkillCategoryDisplay[];
  className?: string;
}

const DEFAULT_CATEGORIES: SkillCategoryDisplay[] = [
  {
    title: "Core Research Domains",
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
];

export const SkillsExpertise: React.FC<SkillsExpertiseProps> = ({
  initialCategories,
  className = "",
}) => {
  const [categories, setCategories] = useState<SkillCategoryDisplay[]>(
    initialCategories || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialCategories);

  useEffect(() => {
    let isMounted = true;

    async function loadSkillsData() {
      try {
        const fetchedCategories: CmsSkillCategory[] = await SkillService.getPublicSkillCategories();

        if (!isMounted) return;

        if (fetchedCategories && fetchedCategories.length > 0) {
          const formatted: SkillCategoryDisplay[] = fetchedCategories
            .filter((cat) => cat.is_visible !== false)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((cat) => {
              const visibleItems = (cat.skill_items || [])
                .filter((item) => item.is_visible !== false)
                .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                .map((item) => item.title);

              return {
                id: cat.id,
                title: cat.title,
                skills: visibleItems,
              };
            });

          setCategories(formatted);
        } else if (!initialCategories) {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error("Failed to load skill categories:", error);
        if (!initialCategories) {
          setCategories(DEFAULT_CATEGORIES);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!initialCategories) {
      loadSkillsData();
    }
  }, [initialCategories]);

  if (isLoading) {
    return (
      <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-xs text-slate-500 font-mono animate-pulse">
            Loading skills & expertise...
          </p>
        </div>
      </Section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

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
              key={cat.id || cat.title}
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
