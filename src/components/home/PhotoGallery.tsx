"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryItem } from "@/src/types/gallery";
import { GalleryService } from "@/src/services/gallery.service";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface PhotoGalleryProps {
  className?: string;
  showViewAll?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  className = "",
  showViewAll = true,
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  // Lightbox Index State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch Public Gallery Items
  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await GalleryService.getPublicGallery();
      setItems(data);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to load public gallery items:", err);
      setError("Unable to load photo gallery at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Top 8 visible images for Homepage display
  const displayedItems = items.slice(0, 8);

  // Active Lightbox Item
  const activeItem = lightboxIndex !== null ? displayedItems[lightboxIndex] : null;

  // Next / Previous Lightbox Handlers
  const handlePrevItem = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! === 0 ? displayedItems.length - 1 : prev! - 1));
    }
  }, [lightboxIndex, displayedItems.length]);

  const handleNextItem = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! === displayedItems.length - 1 ? 0 : prev! + 1));
    }
  }, [lightboxIndex, displayedItems.length]);

  // Lock body scroll and listen to Keyboard controls (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevItem();
      } else if (e.key === "ArrowRight") {
        handleNextItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, handlePrevItem, handleNextItem]);

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
    <Section variant="default" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Background Decorative Ambient Glows */}
      <div
        className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-indigo-600/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-16 max-w-7xl mx-auto">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Media & Events"
          title="Photo Gallery & Activities"
          description="Snapshots from recent conferences, keynote addresses, lab activities, and campus events."
          align="center"
        />

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/40 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-video bg-slate-300 dark:bg-slate-800 rounded-2xl w-full" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
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
            <Button variant="outline" size="sm" onClick={fetchGallery} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedItems.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              🖼️
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Gallery Photos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Event photographs and lab media will be added soon.
            </p>
          </div>
        )}

        {/* Responsive Grid of Gallery Cards */}
        {!isLoading && !error && displayedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedItems.map((item, idx) => {
              const formattedDate = formatDate(item.event_date);
              const category = item.category || "Event Photo";

              return (
                <Card
                  key={item.id}
                  variant="default"
                  hover
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer"
                >
                  {/* Photo Container with Aspect Ratio Preservation */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0">
                    {item.image_url && !failedImageIds[item.id] ? (
                      <img
                        src={item.image_url}
                        alt={item.title || "Gallery photo"}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 p-4 flex flex-col items-center justify-center text-3xl text-amber-400">
                        🖼️
                      </div>
                    )}

                    {/* Gradient Zoom Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold shadow-xl flex items-center justify-center">
                        🔍
                      </div>
                    </div>

                    {/* Featured Overlay Badge */}
                    {item.is_featured && (
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant="accent" size="sm" className="font-bold shadow-md">
                          ★ Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Info Body */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[130px]">
                          {category}
                        </span>
                        {formattedDate && <span>{formattedDate}</span>}
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-amber-500 transition-colors font-sans">
                        {item.title || "Academic Event Photo"}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* View All Gallery Button */}
        {/* Explore Full Gallery Button */}
        {showViewAll && (
          <div className="flex justify-center pt-6">
            <Link href="/gallery" passHref>
              <Button
                variant="primary"
                size="lg"
                className="px-8 shadow-md"
              >
                Explore Full Gallery
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* RESPONSIVE LIGHTBOX MODAL WITH KEYBOARD & PREV/NEXT CONTROLS */}
      <AnimatePresence>
        {activeItem && lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            {/* Lightbox Main Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 space-y-4 p-5 sm:p-6"
            >
              {/* Header: Item Title, Category & Close Button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="pr-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-1">
                    {activeItem.title || "Photo Preview"}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400">
                    <span>{activeItem.category || "General"}</span>
                    {activeItem.event_date && <span>• {formatDate(activeItem.event_date)}</span>}
                    <span className="text-slate-500">
                      ({lightboxIndex + 1} of {displayedItems.length})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Lightbox Image Preview with Prev/Next Navigation Controls */}
              <div className="relative w-full max-h-[70vh] flex items-center justify-center bg-black rounded-2xl overflow-hidden border border-slate-800 group">
                {activeItem.image_url ? (
                  <img
                    src={activeItem.image_url}
                    alt={activeItem.title || "Full Preview"}
                    className="max-h-[70vh] w-auto object-contain select-none"
                  />
                ) : (
                  <div className="p-16 text-slate-500 font-mono text-xs">No Image Available</div>
                )}

                {/* Previous Button */}
                {displayedItems.length > 1 && (
                  <button
                    onClick={handlePrevItem}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 shadow-xl border border-slate-700/80 transition-all cursor-pointer"
                    title="Previous Photo (←)"
                  >
                    ❮
                  </button>
                )}

                {/* Next Button */}
                {displayedItems.length > 1 && (
                  <button
                    onClick={handleNextItem}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 shadow-xl border border-slate-700/80 transition-all cursor-pointer"
                    title="Next Photo (→)"
                  >
                    ❯
                  </button>
                )}
              </div>

              {/* Caption Description */}
              {activeItem.description && (
                <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar pt-1">
                  {activeItem.description}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
};
