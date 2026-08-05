import React from "react";
import Link from "next/link";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  isFeatured?: boolean;
  imageAccent: string;
  icon: React.ReactNode;
  url?: string;
}

export interface LatestNewsProps {
  news?: NewsItem[];
  className?: string;
}

export const LatestNews: React.FC<LatestNewsProps> = ({
  news = [
    {
      id: "news-1",
      title: "Dr. Alex Morgan Delivers Keynote at World AI Summit 2026 on Trustworthy Foundation Models",
      date: "March 28, 2026",
      category: "Keynote Address",
      summary:
        "Presented breakthrough research on automated safety verification and mathematical guarantees for large-scale transformer architectures to over 2,000 international delegates in Geneva.",
      isFeatured: true,
      imageAccent: "from-blue-900 via-indigo-900 to-slate-900 text-amber-400",
      icon: (
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
        </svg>
      ),
    },
    {
      id: "news-2",
      title: "Research Lab Awarded $1.5M NSF Grant for Next-Gen Autonomous System Verification",
      date: "March 12, 2026",
      category: "Research Grant",
      summary:
        "New three-year National Science Foundation grant will fund four Ph.D. scholars developing provably secure autonomous drone controllers.",
      imageAccent: "from-blue-800 to-indigo-900 text-blue-300",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 9L4 7.5v7.5l8 4 8-4V7.5L12 11z" />
        </svg>
      ),
    },
    {
      id: "news-3",
      title: "Paper on Multimodal 3D Vision Accepted for Oral Presentation at CVPR 2026",
      date: "February 18, 2026",
      category: "Publication",
      summary:
        "Collaborative research with graduate students selected as an oral presentation (top 2.5% of submissions) at the upcoming CVPR conference in Seattle.",
      imageAccent: "from-emerald-800 to-teal-900 text-emerald-300",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      ),
    },
    {
      id: "news-4",
      title: "Ph.D. Graduate Sophia Chen Appointed Assistant Professor at Stanford CS",
      date: "January 30, 2026",
      category: "Student Honor",
      summary:
        "Former doctoral scholar Dr. Sophia Chen joins Stanford University faculty after completing her thesis on clinical decision support LLMs.",
      imageAccent: "from-amber-800 to-orange-900 text-amber-300",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      ),
    },
    {
      id: "news-5",
      title: "Professor Alex Morgan Named Co-Chair of ACM Ethics & AI Steering Committee",
      date: "January 14, 2026",
      category: "Academic Service",
      summary:
        "Appointed to lead international committee formulating ethical guidelines and transparency standards for generative AI deployments.",
      imageAccent: "from-indigo-800 to-purple-900 text-indigo-300",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
      ),
    },
    {
      id: "news-6",
      title: "Media Feature: MIT Technology Review Highlights Lab's Work on XAI Governance",
      date: "December 20, 2025",
      category: "Media Feature",
      summary:
        "Feature article discusses how the lab's explainability algorithms are helping regulatory agencies evaluate automated decision systems.",
      imageAccent: "from-teal-800 to-cyan-900 text-teal-300",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z" />
        </svg>
      ),
    },
  ],
  className = "",
}) => {
  const featuredItem = news.find((item) => item.isFeatured) || news[0];
  const regularItems = news.filter((item) => item.id !== featuredItem.id);

  return (
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Background Decorative Ambient Shapes */}
      <div
        className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-16">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Announcements & Activity"
          title="Latest News & Announcements"
          description="Recent academic activities, conferences, achievements, and announcements."
          align="center"
        />

        {/* Featured News Card Highlight */}
        {featuredItem && (
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/10 via-amber-500/10 to-blue-900/10 p-1">
            <Card
              variant="default"
              className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-0 shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Featured Image Graphic Placeholder */}
                <div
                  className={`lg:col-span-5 bg-gradient-to-br ${featuredItem.imageAccent} p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[240px]`}
                >
                  <div className="flex items-center justify-between z-10">
                    <Badge variant="accent" size="md" className="font-bold">
                      ★ Featured News
                    </Badge>
                    <span className="text-xs font-mono font-medium text-slate-200 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                      {featuredItem.date}
                    </span>
                  </div>

                  <div className="z-10 my-auto flex flex-col items-center justify-center text-center p-4">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
                      {featuredItem.icon}
                    </div>
                    <span className="text-sm font-semibold tracking-wider uppercase text-slate-200">
                      {featuredItem.category}
                    </span>
                  </div>
                </div>

                {/* Featured Content Body */}
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {featuredItem.category}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {featuredItem.date}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-snug">
                      {featuredItem.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {featuredItem.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Faculty Announcement</span>

                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      }
                    >
                      Read Full Article
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Responsive Grid of 5 Regular News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularItems.map((item) => (
            <Card
              key={item.id}
              variant="default"
              hover
              className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
            >
              {/* Featured Image Graphic Header */}
              <div
                className={`h-40 w-full bg-gradient-to-br ${item.imageAccent} p-4 flex items-center justify-between relative overflow-hidden shrink-0`}
              >
                <Badge variant="outline" size="sm" className="bg-black/30 backdrop-blur-sm text-white border-white/20 font-medium">
                  {item.category}
                </Badge>

                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  {item.icon}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-blue-900 dark:text-blue-400">
                    {item.date}
                  </span>

                  <CardHeader className="p-0 pb-1">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0">
                    <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal line-clamp-3">
                      {item.summary}
                    </CardDescription>
                  </CardContent>
                </div>

                {/* Read More Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    }
                  >
                    Read More
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All News Button */}
        <div className="flex justify-center pt-6">
          <Link href="#news" passHref>
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
              View All News
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};
