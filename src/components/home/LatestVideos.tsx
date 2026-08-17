"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { VideoRecord } from "@/src/types/video";
import { VideoService } from "@/src/services/video.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface LatestVideosProps {
  className?: string;
  showViewAll?: boolean;
}

export const LatestVideos: React.FC<LatestVideosProps> = ({
  className = "",
  showViewAll = true,
}) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});
  const [activeVideo, setActiveVideo] = useState<VideoRecord | null>(null);

  // Fetch Public Videos
  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await VideoService.getPublicVideos();
      setVideos(data);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to load public video records:", err);
      setError("Unable to load video lectures at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Lock body scroll and handle Escape key for playback modal
  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo]);

  // Display top 6 videos on home page, or all videos on /videos page
  const displayedVideos = showViewAll ? videos.slice(0, 6) : videos;

  // Date formatting helper
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

  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Background Decorative Ambient Shapes */}
      <div
        className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-red-600/5 dark:bg-red-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-16 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Media & Keynotes"
          title="Featured Video Lectures & Talks"
          description="Watch keynote presentations, technical lectures, conference addresses, and seminar series."
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
                <div className="h-44 bg-slate-300 dark:bg-slate-800 rounded-2xl w-full" />
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
            <Button variant="outline" size="sm" onClick={fetchVideos} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedVideos.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              🎬
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Videos Published</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded lectures and keynote videos will be available soon.
            </p>
          </div>
        )}

        {/* Responsive Grid of Video Cards */}
        {!isLoading && !error && displayedVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedVideos.map((video) => {
              const formattedDate = formatDate(video.published_at);
              const category = (video as any).category || "Keynote / Lecture";
              const duration = (video as any).duration || "Video Talk";

              return (
                <Card
                  key={video.id}
                  variant="default"
                  hover
                  className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-red-400 dark:hover:border-red-500"
                >
                  {/* Thumbnail Container with Play Overlay */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0 group/thumb cursor-pointer" onClick={() => setActiveVideo(video)}>
                    {video.thumbnail_url && !failedImageIds[video.id] ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-full w-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                        onError={() => setFailedImageIds((prev) => ({ ...prev, [video.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <Badge variant="accent" size="sm" className="bg-red-500/20 text-red-300 border border-red-500/30">
                            {category}
                          </Badge>
                          {video.is_featured && (
                            <Badge variant="accent" size="sm" className="font-bold">
                              ★ Featured
                            </Badge>
                          )}
                        </div>
                        <div className="text-center text-red-400 font-bold text-3xl">
                          🎬
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400">{duration}</span>
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay & Play Button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-center justify-center group-hover/thumb:bg-slate-950/50 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 text-white shadow-xl flex items-center justify-center pl-1 group-hover/thumb:scale-110 group-hover/thumb:bg-red-500 transition-all duration-300 border border-white/20">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Top Overlay Badges */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      {video.is_featured && video.thumbnail_url && (
                        <Badge variant="accent" size="sm" className="font-bold shadow-md">
                          ★ Featured
                        </Badge>
                      )}
                    </div>

                    {/* Duration Badge Bottom Right */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <span className="text-[10px] font-mono font-bold text-white bg-slate-950/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-slate-700/60">
                        {duration}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                          {formattedDate || "Video Lecture"}
                        </span>
                        <Badge variant="outline" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                          {category}
                        </Badge>
                      </div>

                      <CardHeader className="p-0 pb-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-sans leading-snug line-clamp-2">
                          {video.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-0">
                        <CardDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3">
                          {video.description || "Video lecture details will be added soon."}
                        </CardDescription>
                      </CardContent>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveVideo(video)}
                        className="bg-red-600 hover:bg-red-500 text-white font-semibold flex-1 justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Watch Video</span>
                      </Button>

                      {video.youtube_url && (
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Open YouTube Link in New Tab"
                        >
                          <span>YouTube</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All Videos Button */}
        {showViewAll && (
          <div className="flex justify-center pt-4">
            <Link href="/videos" passHref>
              <Button
                variant="primary"
                size="lg"
                className="px-8 shadow-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
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
                View All Videos
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* PLAYABLE LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            {/* Lightbox Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 space-y-4 p-5 sm:p-6"
            >
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="pr-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-1">
                    {activeVideo.title}
                  </h3>
                  {activeVideo.youtube_video_id && (
                    <span className="text-[11px] font-mono text-red-400">
                      YouTube Video ID: {activeVideo.youtube_video_id}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Video (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* 16:9 Aspect Ratio Iframe Container */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                <iframe
                  src={
                    activeVideo.embed_url ||
                    (activeVideo.youtube_video_id
                      ? `https://www.youtube.com/embed/${activeVideo.youtube_video_id}?autoplay=1`
                      : "")
                  }
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Video Description */}
              {activeVideo.description && (
                <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar pt-1">
                  {activeVideo.description}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
};
