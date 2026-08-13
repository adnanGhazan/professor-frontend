"use client";

import React, { useEffect, useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { ResearchVisionService } from "@/src/services/research-vision.service";
import { ResearchVision, ResearchMethodology } from "@/src/types/research-vision";

export interface ResearchSummaryProps {
  initialVision?: ResearchVision | null;
  className?: string;
}

const renderIcon = (iconKey?: string | null) => {
  const key = (iconKey || "").toLowerCase().trim();

  if (
    key.includes("shield") ||
    key.includes("verification") ||
    key.includes("trust") ||
    key.includes("safety") ||
    key.includes("verified") ||
    key.includes("check")
  ) {
    return (
      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }

  if (
    key.includes("vision") ||
    key.includes("camera") ||
    key.includes("eye") ||
    key.includes("computer") ||
    key.includes("multimodal") ||
    key.includes("ai") ||
    key.includes("monitor") ||
    key.includes("cpu") ||
    key.includes("code")
  ) {
    return (
      <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }

  if (
    key.includes("privacy") ||
    key.includes("security") ||
    key.includes("responsible") ||
    key.includes("ethics") ||
    key.includes("leaf") ||
    key.includes("scale") ||
    key.includes("lock")
  ) {
    return (
      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
  }

  // Graceful Fallback Icon
  return (
    <svg className="w-6 h-6 text-amber-500 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

export const ResearchSummary: React.FC<ResearchSummaryProps> = ({
  initialVision,
  className = "",
}) => {
  const [vision, setVision] = useState<ResearchVision | null>(initialVision || null);
  const [methodologies, setMethodologies] = useState<ResearchMethodology[]>(
    initialVision?.methodologies || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialVision);

  useEffect(() => {
    let isMounted = true;

    async function loadResearchVisionData() {
      try {
        const [fetchedVision, fetchedMethodologies] = await Promise.all([
          ResearchVisionService.getPublicResearchVision(),
          ResearchVisionService.getPublicMethodologies(),
        ]);

        if (!isMounted) return;

        if (fetchedVision) {
          setVision(fetchedVision);
          if (fetchedVision.methodologies && fetchedVision.methodologies.length > 0) {
            const visibleMeths = fetchedVision.methodologies
              .filter((m) => m.is_visible !== false)
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
            setMethodologies(visibleMeths);
          } else if (fetchedMethodologies && fetchedMethodologies.length > 0) {
            setMethodologies(fetchedMethodologies);
          }
        } else if (fetchedMethodologies && fetchedMethodologies.length > 0) {
          setMethodologies(fetchedMethodologies);
        }
      } catch (error) {
        console.error("Failed to load research vision data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!initialVision) {
      loadResearchVisionData();
    }
  }, [initialVision]);

  if (isLoading) {
    return (
      <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-xs text-slate-500 font-mono animate-pulse">
            Loading research vision & methodologies...
          </p>
        </div>
      </Section>
    );
  }

  // If vision record is explicitly hidden
  if (vision && vision.is_visible === false) {
    return null;
  }

  const sectionTitle = vision?.section_title || "Research Interests Summary";
  const sectionSubtitle =
    vision?.section_subtitle ||
    "Foundational research focus, methodology, and long-term scientific objectives.";
  const badgeText = vision?.badge_text || "Interdisciplinary AI Innovation";
  const summaryText =
    vision?.summary ||
    "Our research agenda addresses fundamental scientific challenges in artificial intelligence, computer vision, and privacy-preserving machine learning. By combining rigorous mathematical foundations with practical system design, we aim to engineer reliable, scalable, and trustworthy intelligent systems for complex real-world applications.";

  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Research Vision & Methodology"
          title={sectionTitle}
          description={sectionSubtitle}
          align="center"
        />

        {/* Overview Box */}
        {summaryText && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl mx-auto text-center space-y-4">
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {summaryText}
            </p>
            {badgeText && (
              <Badge variant="primary" size="md" className="uppercase font-semibold tracking-wider">
                {badgeText}
              </Badge>
            )}
          </div>
        )}

        {/* Methodologies Pillars Grid */}
        {methodologies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {methodologies.map((item) => (
              <Card
                key={item.id || item.title}
                variant="default"
                hover
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-0 pb-4">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit mb-3">
                      {renderIcon(item.icon_key)}
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans leading-snug">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {item.description && (
                      <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </CardDescription>
                    )}
                  </CardContent>
                </div>

                {item.footer_text && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-[11px] font-mono font-semibold text-blue-900 dark:text-blue-400">
                      {item.footer_text}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};
