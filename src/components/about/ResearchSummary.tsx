import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export interface ResearchPillar {
  title: string;
  summary: string;
  impact: string;
  icon: React.ReactNode;
}

export interface ResearchSummaryProps {
  pillars?: ResearchPillar[];
  overviewText?: string;
  className?: string;
}

export const ResearchSummary: React.FC<ResearchSummaryProps> = ({
  overviewText = "Our research agenda addresses fundamental challenges at the nexus of deep representation learning, automated safety verification, and responsible AI deployment. By combining rigorous mathematical foundations with practical system design, we aim to engineer trustworthy intelligent systems capable of operating in high-stakes autonomous and medical domains.",
  pillars = [
    {
      title: "Trustworthy & Verified AI Systems",
      summary: "Developing formal verification techniques and SMT solver methods to prove safety boundaries in neural controllers before real-world deployment.",
      impact: "15+ TPAMI & PLDI Papers • NSF Funded",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Multimodal Foundation Models",
      summary: "Investigating transformer scaling laws, self-supervised pretraining objectives, and efficient attention mechanisms for vision-language models.",
      impact: "CVPR & NeurIPS Oral Presentations",
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Privacy-Preserving & Ethical ML",
      summary: "Differential privacy protocols, federated learning frameworks, and algorithmic fairness metrics designed to protect sensitive user data.",
      impact: "ACM CCS & Industry Collaboration",
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ],
  className = "",
}) => {
  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Research Vision & Methodology"
          title="Research Interests Summary"
          description="Foundational research focus, methodology, and long-term scientific objectives."
          align="center"
        />

        {/* Overview Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl mx-auto text-center space-y-4">
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {overviewText}
          </p>
          <Badge variant="primary" size="md" className="uppercase font-semibold tracking-wider">
            Interdisciplinary AI Innovation
          </Badge>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              variant="default"
              hover
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-0 pb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit mb-3">
                    {pillar.icon}
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans leading-snug">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.summary}
                  </CardDescription>
                </CardContent>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] font-mono font-semibold text-blue-900 dark:text-blue-400">
                  {pillar.impact}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};
