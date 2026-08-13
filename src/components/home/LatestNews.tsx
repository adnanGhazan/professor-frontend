"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { NewsArticle } from "@/src/types/news";
import { NewsService } from "@/src/services/news.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface LatestNewsProps {
  className?: string;
}

export const LatestNews: React.FC<LatestNewsProps> = ({ className = "" }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  // Fetch Public News Articles
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await NewsService.getPublicNews();
      setArticles(data);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to load public news articles:", err);
      setError("Unable to load news and announcements at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Display top 6 news articles
  const displayedArticles = articles.slice(0, 6);

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr.slice(0, 10);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  // Extract excerpt preview fallback
  const getExcerpt = (article: NewsArticle) => {
    if (article.excerpt) return article.excerpt;
    if (article.content) {
      const cleanText = article.content.replace(/<[^>]*>?/gm, "").trim();
      return cleanText.length > 150 ? cleanText.slice(0, 150) + "..." : cleanText;
    }
    return "News article content will be added soon.";
  };

  // Get external URL if present
  const getArticleUrl = (article: NewsArticle) => {
    if ((article as any).external_url) {
      return (article as any).external_url;
    }
    return "/news";
  };

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

      <div className="relative z-10 space-y-16 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Announcements & Activity"
          title="Latest News & Announcements"
          description="Recent academic activities, conferences, achievements, and press releases."
          align="center"
        />

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/40 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse"
              >
                <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-2xl w-full" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!isLoading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <p className="text-sm font-medium text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchNews} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedArticles.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              📰
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No News Articles Published</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              News and announcements will be posted soon. Please check back later.
            </p>
          </div>
        )}

        {/* Responsive Grid of News Cards */}
        {!isLoading && !error && displayedArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedArticles.map((article) => {
              const formattedDate = formatDate(article.published_at);
              const articleUrl = getArticleUrl(article);
              const isExternal = articleUrl.startsWith("http");

              return (
                <Card
                  key={article.id}
                  variant="default"
                  hover
                  className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
                >
                  {/* Featured Header Graphic / Image */}
                  <div className="h-44 w-full bg-slate-800 relative overflow-hidden shrink-0 flex items-center justify-center">
                    {article.image_url && !failedImageIds[article.id] ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setFailedImageIds((prev) => ({ ...prev, [article.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" size="sm" className="bg-black/40 backdrop-blur-sm text-amber-300 border-amber-500/30 font-medium">
                            Academic News
                          </Badge>
                          {article.is_featured && (
                            <Badge variant="accent" size="sm" className="font-bold">
                              ★ Featured
                            </Badge>
                          )}
                        </div>
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 w-12 h-12 flex items-center justify-center text-xl text-amber-400 mx-auto">
                          📰
                        </div>
                        <div className="text-right">
                          {formattedDate && (
                            <span className="text-[10px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded">
                              {formattedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Featured Overlay Badge when Image is Present */}
                    {article.image_url && !failedImageIds[article.id] && article.is_featured && (
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant="accent" size="sm" className="font-bold shadow-md">
                          ★ Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-blue-900 dark:text-blue-400">
                          {formattedDate || "Academic News"}
                        </span>
                        <Badge variant="outline" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                          {(article as any).category || "Announcement"}
                        </Badge>
                      </div>

                      <CardHeader className="p-0 pb-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-0">
                        <CardDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
                          {getExcerpt(article)}
                        </CardDescription>
                      </CardContent>
                    </div>

                    {/* Read More Action Button */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      {isExternal ? (
                        <a
                          href={articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
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
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            }
                          >
                            Read Full Article
                          </Button>
                        </a>
                      ) : (
                        <Link href="/news" passHref className="w-full">
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
                            Read Article
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All News Action Button */}
        <div className="flex justify-center pt-6">
          <Link href="/news" passHref>
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
