"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NewsArticle } from "@/src/types/news";
import { NewsService } from "@/src/services/news.service";
import { Section } from "@/src/components/ui/section";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

export default function NewsArticleDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch public news list
      const articles = await NewsService.getPublicNews();
      let matchedArticle = articles.find(
        (a) => String(a.slug) === String(slug) || String(a.id) === String(slug)
      );

      // 2. Fallback: try fetching by ID directly if slug was not matched in list
      if (!matchedArticle) {
        try {
          matchedArticle = await NewsService.getNewsById(slug);
        } catch (e) {
          // ignore fallback fetch error
        }
      }

      if (!matchedArticle) {
        setError("The requested news article could not be found.");
        setIsLoading(false);
        return;
      }

      setArticle(matchedArticle);
    } catch (err: unknown) {
      console.error("Failed to load news article details:", err);
      setError("Unable to load news article details at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr.slice(0, 10);
      return dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  const formattedDate = formatDate(article?.published_at);
  const imageUrl = article?.image_url || article?.featured_image;
  const hasValidImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Back Navigation Bar */}
      <Section variant="default" padding="sm" className="pt-8 pb-4 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/news">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-900 cursor-pointer"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back to News
            </Button>
          </Link>
        </div>
      </Section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* LOADING STATE */}
        {isLoading && (
          <div className="space-y-8 animate-pulse">
            <div className="h-6 bg-slate-900 rounded-xl w-1/4" />
            <div className="h-10 bg-slate-900 rounded-xl w-3/4" />
            <div className="w-full h-80 bg-slate-900 rounded-3xl" />
            <div className="space-y-3 pt-4">
              <div className="h-5 bg-slate-900 rounded w-full" />
              <div className="h-5 bg-slate-900 rounded w-5/6" />
              <div className="h-5 bg-slate-900 rounded w-4/6" />
            </div>
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!isLoading && (error || !article) && (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-6 max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">News Article Not Found</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {error || "The requested news article could not be located."}
              </p>
            </div>
            <Link href="/news">
              <Button variant="primary" size="md">
                Browse All News
              </Button>
            </Link>
          </div>
        )}

        {/* MAIN DETAIL CONTENT */}
        {!isLoading && !error && article && (
          <article className="space-y-10">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {formattedDate && (
                  <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
                    {formattedDate}
                  </span>
                )}
                {article.is_featured && (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="bg-amber-500/90 text-slate-950 font-bold border border-amber-400 px-3 py-1"
                  >
                    ★ Featured News
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed border-l-4 border-amber-500/80 pl-4 py-1 italic bg-amber-500/5 rounded-r-2xl">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Featured Image Header */}
            {hasValidImage && (
              <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <img
                  src={imageUrl!}
                  alt={article.title}
                  onError={() => setImageFailed(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Body Content */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
              <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-base sm:text-lg space-y-4 font-normal whitespace-pre-line">
                {article.content && article.content.trim().length > 0
                  ? article.content
                  : article.excerpt || "Full article text content will be updated soon."}
              </div>

              {/* External Source Link Button (if external_url is present) */}
              {article.external_url && (
                <div className="pt-6 border-t border-slate-800">
                  <a
                    href={article.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4"
                  >
                    <span>Read Original Article on External Source</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
