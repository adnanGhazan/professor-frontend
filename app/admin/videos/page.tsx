"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { VideoService } from "@/src/services/video.service";
import { VideoRecord, VideoPagination } from "@/src/types/video";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminVideosPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [pagination, setPagination] = useState<VideoPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<string>("");
  const [isVisibleFilter, setIsVisibleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Status States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Video Playback Modal State
  const [previewVideo, setPreviewVideo] = useState<VideoRecord | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

  // Image Load Fail Tracker
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<VideoRecord | null>(null);

  // Fetch Videos List
  const fetchVideosList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await VideoService.getAdminVideos({
        search: searchQuery,
        is_featured: isFeaturedFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setVideos(data.items);
      setPagination(data.pagination);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to fetch videos list:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, isFeaturedFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchVideosList();
  }, [router, fetchVideosList]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || deletingItem || previewVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, deletingItem, previewVideo]);

  // Handle Thumbnail selection and preview
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreviewUrl(url);
    }
  };

  // Clear selected Thumbnail file
  const handleRemoveThumbnailFile = () => {
    setSelectedThumbnailFile(null);
    if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }
    setThumbnailPreviewUrl(null);
  };

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setYoutubeUrl("");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setDescription("");
    setIsFeatured(false);
    setIsVisible(true);
    setSelectedThumbnailFile(null);
    setCurrentThumbnailUrl(null);
    setThumbnailPreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: VideoRecord) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setYoutubeUrl(item.youtube_url || (item.youtube_video_id ? `https://www.youtube.com/watch?v=${item.youtube_video_id}` : ""));
    setPublishedAt(item.published_at ? item.published_at.slice(0, 10) : "");
    setDescription(item.description || "");
    setIsFeatured(Boolean(item.is_featured));
    setIsVisible(item.is_visible !== false);
    setSelectedThumbnailFile(null);
    setCurrentThumbnailUrl(item.thumbnail_url || null);
    setThumbnailPreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingId(null);
      setValidationErrors(null);
      setSelectedThumbnailFile(null);
      setCurrentThumbnailUrl(null);
      if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
      setThumbnailPreviewUrl(null);
    }
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors(null);

    try {
      if (selectedThumbnailFile || editingId) {
        const formData = new FormData();
        formData.append("title", title);
        if (slug) formData.append("slug", slug);
        if (youtubeUrl) formData.append("youtube_url", youtubeUrl);
        if (publishedAt) formData.append("published_at", publishedAt);
        if (description) formData.append("description", description);
        formData.append("is_featured", isFeatured ? "1" : "0");
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedThumbnailFile) {
          formData.append("thumbnail", selectedThumbnailFile);
          formData.append("image", selectedThumbnailFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/videos/{id}
          await VideoService.updateVideo(editingId, formData);
          setSuccessMsg("Video record updated successfully!");
        } else {
          await VideoService.createVideo(formData);
          setSuccessMsg("Video record created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<VideoRecord> = {
          title,
          slug: slug || null,
          youtube_url: youtubeUrl || null,
          published_at: publishedAt || null,
          description: description || null,
          is_featured: isFeatured,
          is_visible: isVisible,
        };

        if (editingId) {
          await VideoService.updateVideo(editingId, payload);
          setSuccessMsg("Video record updated successfully!");
        } else {
          await VideoService.createVideo(payload);
          setSuccessMsg("Video record created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchVideosList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save video record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: VideoRecord) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await VideoService.deleteVideo(deletingItem.id);
      setSuccessMsg(`Video record "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchVideosList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete video record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Video Lectures & Media Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage keynote presentations, recorded lectures, seminar talks, and embedded YouTube videos.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span>Add Video</span>
        </button>
      </div>

      {/* Success Banner Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner Alert */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar: Search, Filters, Sorting */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar (title, description) */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by video title or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Featured Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Featured:</span>
            <select
              value={isFeaturedFilter}
              onChange={(e) => {
                setIsFeaturedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All</option>
              <option value="1" className="bg-slate-900 text-slate-200">Featured</option>
              <option value="0" className="bg-slate-900 text-slate-200">Standard</option>
            </select>
          </div>

          {/* Visible Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Visibility:</span>
            <select
              value={isVisibleFilter}
              onChange={(e) => {
                setIsVisibleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All</option>
              <option value="1" className="bg-slate-900 text-slate-200">Visible</option>
              <option value="0" className="bg-slate-900 text-slate-200">Hidden</option>
            </select>
          </div>

          {/* Sort By Field */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="published_at" className="bg-slate-900 text-slate-200">Published At</option>
              <option value="title" className="bg-slate-900 text-slate-200">Title</option>
              <option value="created_at" className="bg-slate-900 text-slate-200">Created At</option>
            </select>

            <button
              onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
              title={`Sort Direction: ${sortDir.toUpperCase()}`}
              className="p-1 rounded text-amber-400 hover:bg-slate-800 transition-colors ml-1"
            >
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono hidden xl:block ml-2">
            Total: <strong className="text-slate-200">{pagination.total}</strong>
          </div>
        </div>
      </div>

      {/* Loading Table State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-sm font-medium text-slate-400 animate-pulse font-mono">
            Fetching video records...
          </p>
        </div>
      ) : videos.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Videos Found"
          description={
            searchQuery || isFeaturedFilter || isVisibleFilter
              ? "No video records match your filter parameters. Try clearing your search filters."
              : "No video records added yet. Click 'Add Video' to register one."
          }
        />
      ) : (
        /* Videos Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Video & Thumbnail</th>
                    <th className="py-4 px-6 text-center">YouTube Video ID</th>
                    <th className="py-4 px-6 text-center">Preview Playback</th>
                    <th className="py-4 px-6 text-center">Published Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {videos.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Video Title & Thumbnail */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-lg">
                            {item.thumbnail_url && !failedImageIds[item.id] ? (
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="h-full w-full object-cover"
                                onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
                              />
                            ) : (
                              <span>🎬</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* YouTube Video ID Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {item.youtube_video_id ? (
                          <span className="inline-block px-2.5 py-1 rounded-md font-mono text-[11px] font-bold bg-slate-800 text-amber-400 border border-amber-500/20">
                            {item.youtube_video_id}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Playable Preview Action */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {item.embed_url || item.youtube_video_id ? (
                          <button
                            onClick={() => setPreviewVideo(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>▶ Play Video</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px] font-mono">No embed</span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td className="py-4 px-6 text-center whitespace-nowrap font-mono text-slate-300">
                        {item.published_at ? item.published_at.slice(0, 10) : "N/A"}
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-6 text-center whitespace-nowrap space-y-1">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                              item.is_featured
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-slate-800/60 text-slate-500 border-slate-700/60"
                            }`}
                          >
                            {item.is_featured ? "★ Featured" : "Standard"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                              item.is_visible !== false
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {item.is_visible !== false ? "Visible" : "Hidden"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(item)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 font-mono">
                Page <strong className="text-slate-200">{pagination.current_page}</strong> of{" "}
                <strong className="text-slate-200">{pagination.total_pages}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= pagination.total_pages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.total_pages))}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLAYABLE VIDEO PREVIEW MODAL */}
      <AnimatePresence>
        {previewVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewVideo(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 space-y-4 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="pr-4">
                  <h3 className="text-base font-bold text-slate-100 line-clamp-1">
                    {previewVideo.title}
                  </h3>
                  {previewVideo.youtube_video_id && (
                    <span className="text-[11px] font-mono text-amber-400">
                      YouTube ID: {previewVideo.youtube_video_id}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Embedded Player Aspect Container */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
                <iframe
                  src={
                    previewVideo.embed_url ||
                    (previewVideo.youtube_video_id
                      ? `https://www.youtube.com/embed/${previewVideo.youtube_video_id}?autoplay=1`
                      : "")
                  }
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {previewVideo.description && (
                <p className="text-xs text-slate-400 line-clamp-2 pt-1">
                  {previewVideo.description}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT FORM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950 z-10 my-auto flex flex-col overflow-hidden"
            >
              {/* Sticky Header */}
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                    {editingId ? "Edit Video Record" : "Add Video Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId
                      ? "Modify video title, YouTube URL, description, or custom cover thumbnail."
                      : "Register a new keynote presentation, lecture, or YouTube video."}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Video Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="video-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Video Title <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="video-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Keynote Address on Trustworthy AI Systems — World Summit 2026"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                      )}
                    </div>

                    {/* YouTube URL */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="video-youtube-url" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        YouTube Video URL <span className="text-slate-500 text-[10px] font-mono font-normal">(e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or youtu.be/...)</span>
                      </label>
                      <input
                        id="video-youtube-url"
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.youtube_url?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.youtube_url[0]}</p>
                      )}
                    </div>

                    {/* Custom Slug */}
                    <div className="space-y-1">
                      <label htmlFor="video-slug" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Custom Slug <span className="text-slate-500 text-[10px] font-mono font-normal">(Auto-generated if blank)</span>
                      </label>
                      <input
                        id="video-slug"
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="keynote-trustworthy-ai-2026"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.slug?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.slug[0]}</p>
                      )}
                    </div>

                    {/* Published Date */}
                    <div className="space-y-1">
                      <label htmlFor="video-published-at" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Published Date
                      </label>
                      <input
                        id="video-published-at"
                        type="date"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.published_at?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.published_at[0]}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="video-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Video Description / Summary
                      </label>
                      <textarea
                        id="video-description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Lecture summary, topic overview, and speaker presentation highlights..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.description?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                      )}
                    </div>

                    {/* Custom Thumbnail Upload & Preview */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Custom Thumbnail Image Upload <span className="text-slate-500 text-[10px] font-mono font-normal">(Optional: YouTube default HQ image used if unselected)</span>
                      </label>

                      {/* Image Preview or File Picker */}
                      {(thumbnailPreviewUrl || currentThumbnailUrl) && !selectedThumbnailFile ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-10 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-800 shrink-0">
                              <img
                                src={thumbnailPreviewUrl || currentThumbnailUrl || ""}
                                alt="Video thumbnail preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-200 block">Current Video Thumbnail</span>
                              <span className="text-[10px] text-slate-500">Custom thumbnail attached to record</span>
                            </div>
                          </div>

                          <label
                            htmlFor="video-thumbnail-file"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Replace Thumbnail
                          </label>
                        </div>
                      ) : selectedThumbnailFile && thumbnailPreviewUrl ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-10 rounded-xl overflow-hidden border border-amber-500/50 bg-slate-800 shrink-0">
                              <img
                                src={thumbnailPreviewUrl}
                                alt="New thumbnail preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="truncate max-w-xs">
                              <span className="text-xs font-semibold text-amber-300 block truncate">
                                {selectedThumbnailFile.name}
                              </span>
                              <span className="text-[10px] text-amber-400/80">
                                ({(selectedThumbnailFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveThumbnailFile}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="video-thumbnail-file"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <rect width="20" height="15" x="2" y="4.5" rx="2.5" />
                            <polygon points="10 9 15 12 10 15 10 9" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to upload custom video thumbnail image
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            PNG, JPG, WebP up to 2MB
                          </span>
                        </label>
                      )}

                      <input
                        id="video-thumbnail-file"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                      />

                      {validationErrors?.thumbnail?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.thumbnail[0]}</p>
                      )}
                    </div>

                    {/* Checkboxes: Featured & Visible */}
                    <div className="space-y-3 pt-2 sm:col-span-2 flex flex-row items-center gap-8">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                        />
                        <span className="text-xs font-semibold text-slate-300">
                          Mark as Featured Video
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => setIsVisible(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                        />
                        <span className="text-xs font-semibold text-slate-300">
                          Visible on Public Website
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sticky Action Buttons Footer */}
                <div className="shrink-0 flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md z-10">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" variant="primary" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingId ? "Update Video" : "Create Video"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setDeletingItem(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Confirm Deletion</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                Are you sure you want to delete the video record{" "}
                <strong className="text-slate-100">"{deletingItem.title}"</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" variant="primary" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Record</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
