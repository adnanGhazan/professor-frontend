import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface ResearchAreaItem {
  id: string;
  title: string;
  description: string;
  publicationsCount: string;
  icon: React.ReactNode;
  tags?: string[];
}

export interface ResearchAreasProps {
  areas?: ResearchAreaItem[];
  className?: string;
}

export const ResearchAreas: React.FC<ResearchAreasProps> = ({
  areas = [
    {
      id: "ai",
      title: "Artificial Intelligence",
      description:
        "Autonomous agents, multi-agent coordination, heuristic search, and decision-making under complex uncertain environments.",
      publicationsCount: "42 Publications",
      tags: ["Autonomous Agents", "Multi-Agent", "Heuristic Search"],
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
        </svg>
      ),
    },
    {
      id: "ml",
      title: "Machine Learning",
      description:
        "Supervised and unsupervised learning algorithms, statistical modeling, hyperparameter optimization, and generalization bounds.",
      publicationsCount: "58 Publications",
      tags: ["Optimization", "Statistical Learning", "Algorithmic Bounds"],
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "dl",
      title: "Deep Learning",
      description:
        "Transformer architectures, deep neural network optimization, self-supervised pre-training, and generative AI models.",
      publicationsCount: "36 Publications",
      tags: ["Transformers", "Generative AI", "Representation Learning"],
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "cv",
      title: "Computer Vision",
      description:
        "Object detection, 3D spatial scene reconstruction, medical image diagnosis, and real-time visual reasoning systems.",
      publicationsCount: "29 Publications",
      tags: ["3D Vision", "Medical Imaging", "Object Detection"],
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: "nlp",
      title: "Natural Language Processing",
      description:
        "Large language models (LLMs), computational linguistics, semantic parsing, cross-lingual translation, and alignment.",
      publicationsCount: "31 Publications",
      tags: ["LLMs", "Semantic Parsing", "Computational Linguistics"],
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: "security",
      title: "Cyber Security",
      description:
        "Cryptographic protocols, system vulnerability assessment, network intrusion detection, and privacy-preserving ML.",
      publicationsCount: "24 Publications",
      tags: ["Cryptography", "System Security", "Privacy ML"],
      icon: (
        <svg className="w-6 h-6 text-rose-600 dark:text-rose-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ],
  className = "",
}) => {
  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Background Decorative Gradient Orbs */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-12">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Specialization"
          title="Research Areas"
          description="Current research domains and expertise."
          align="center"
        />

        {/* Responsive Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area) => (
            <Card
              key={area.id}
              variant="default"
              hover
              className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
            >
              <div>
                {/* Header: Icon & Publication Count Badge */}
                <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between space-y-0">
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-all duration-300">
                    {area.icon}
                  </div>
                  <Badge variant="primary" size="sm" className="font-semibold text-xs">
                    {area.publicationsCount}
                  </Badge>
                </CardHeader>

                {/* Content: Title & Description */}
                <CardContent className="p-0 pt-2 space-y-3">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans">
                    {area.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {area.description}
                  </CardDescription>
                </CardContent>
              </div>

              {/* Footer: Learn More Action Button & Tags */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                {area.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {area.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

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
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};
