"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { NewsService } from "@/src/services/news.service";
import { NewsArticle, NewsPagination } from "@/src/types/news";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminNewsPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [pagination, setPagination] = useState<NewsPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<string>("");
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

  // Form Fields State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [status, setStatus] = useState<string>("published");
  const [publishedAt, setPublishedAt] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Image Load Fail Tracker
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<NewsArticle | null>(null);

  // Fetch News List
  const fetchNewsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await NewsService.getAdminNews({
        search: searchQuery,
        status: statusFilter,
        is_featured: isFeaturedFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setArticles(data.items);
      setPagination(data.pagination);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to fetch news list:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, isFeaturedFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchNewsList();
  }, [router, fetchNewsList]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || deletingItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, deletingItem]);

  // Handle Image selection and preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  // Clear selected Image file
  const handleRemoveImageFile = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
  };

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExternalUrl("");
    setStatus("published");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setExcerpt("");
    setContent("");
    setSeoTitle("");
    setSeoDescription("");
    setIsFeatured(false);
    setSelectedImageFile(null);
    setCurrentImageUrl(null);
    setImagePreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: NewsArticle) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setExternalUrl(item.external_url || "");
    setStatus(item.status || "published");
    setPublishedAt(item.published_at ? item.published_at.slice(0, 10) : "");
    setExcerpt(item.excerpt || "");
    setContent(item.content || "");
    setSeoTitle(item.seo_title || "");
    setSeoDescription(item.seo_description || "");
    setIsFeatured(Boolean(item.is_featured));
    setSelectedImageFile(null);
    setCurrentImageUrl(item.image_url || null);
    setImagePreviewUrl(null);
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
      setSelectedImageFile(null);
      setCurrentImageUrl(null);
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
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
      if (selectedImageFile || editingId) {
        const formData = new FormData();
        formData.append("title", title);
        if (slug) formData.append("slug", slug);
        if (externalUrl) formData.append("external_url", externalUrl);
        if (status) formData.append("status", status);
        if (publishedAt) formData.append("published_at", publishedAt);
        if (excerpt) formData.append("excerpt", excerpt);
        if (content) formData.append("content", content);
        if (seoTitle) formData.append("seo_title", seoTitle);
        if (seoDescription) formData.append("seo_description", seoDescription);
        formData.append("is_featured", isFeatured ? "1" : "0");

        if (selectedImageFile) {
          formData.append("featured_image", selectedImageFile);
          formData.append("image", selectedImageFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/news/{id}
          await NewsService.updateNews(editingId, formData);
          setSuccessMsg("News article updated successfully!");
        } else {
          await NewsService.createNews(formData);
          setSuccessMsg("News article created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<NewsArticle> = {
          title,
          slug: slug || null,
          external_url: externalUrl || null,
          status,
          published_at: publishedAt || null,
          excerpt: excerpt || null,
          content: content || null,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          is_featured: isFeatured,
        };

        if (editingId) {
          await NewsService.updateNews(editingId, payload);
          setSuccessMsg("News article updated successfully!");
        } else {
          await NewsService.createNews(payload);
          setSuccessMsg("News article created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchNewsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save news article.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: NewsArticle) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await NewsService.deleteNews(deletingItem.id);
      setSuccessMsg(`News article "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchNewsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete news article.");
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
            News & Announcements Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic press releases, research breakthroughs, conference announcements, and faculty news.
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
          <span>Add News</span>
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
        {/* Search Bar (title, excerpt, content) */}
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
            placeholder="Search by news title, excerpt, or body content..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Statuses</option>
              <option value="published" className="bg-slate-900 text-slate-200">Published</option>
              <option value="draft" className="bg-slate-900 text-slate-200">Draft</option>
            </select>
          </div>

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
              <option value="created_at" className="bg-slate-900 text-slate-200">Created At</option>
              <option value="title" className="bg-slate-900 text-slate-200">Title</option>
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
            Fetching news articles...
          </p>
        </div>
      ) : articles.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No News Articles Found"
          description={
            searchQuery || statusFilter || isFeaturedFilter
              ? "No news articles match your filter parameters. Try clearing your search filters."
              : "No news articles created yet. Click 'Add News' to publish one."
          }
        />
      ) : (
        /* News Articles Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Article & Image</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6 text-center">Published Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {articles.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Title & Featured Image */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-lg">
                            {item.image_url && !failedImageIds[item.id] ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="h-full w-full object-cover"
                                onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
                              />
                            ) : (
                              <span>📰</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                              {item.title}
                            </div>
                            {item.excerpt && (
                              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {item.excerpt}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-4 px-6 font-mono text-slate-400 max-w-xs truncate">
                        {item.slug || "—"}
                      </td>

                      {/* Published Date */}
                      <td className="py-4 px-6 text-center whitespace-nowrap font-mono text-slate-300">
                        {item.published_at ? item.published_at.slice(0, 10) : "Draft"}
                      </td>

                      {/* Status & Featured Badges */}
                      <td className="py-4 px-6 text-center whitespace-nowrap space-y-1">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                              item.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {item.status === "published" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                            {item.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>
                        {item.is_featured && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              ★ Featured
                            </span>
                          </div>
                        )}
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
                    {editingId ? "Edit News Article" : "Add News Article"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId
                      ? "Modify news title, slug, body content, image, or SEO metadata."
                      : "Create and publish a new academic announcement or research press release."}
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
                    {/* Article Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="news-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Article Title <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="news-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Breakthrough Neural Verification Research Published in Nature AI"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="news-slug" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Custom Slug <span className="text-slate-500 text-[10px] font-mono font-normal">(Auto-generated from title if blank)</span>
                      </label>
                      <input
                        id="news-slug"
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="breakthrough-neural-verification-nature-ai"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.slug?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.slug[0]}</p>
                      )}
                    </div>

                    {/* External News URL */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="news-external-url" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        External News URL
                      </label>
                      <input
                        id="news-external-url"
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://example.com/news/article"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.external_url?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.external_url[0]}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label htmlFor="news-status" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Publishing Status
                      </label>
                      <select
                        id="news-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                      >
                        <option value="published" className="bg-slate-900 text-slate-200">Published</option>
                        <option value="draft" className="bg-slate-900 text-slate-200">Draft</option>
                      </select>
                      {validationErrors?.status?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.status[0]}</p>
                      )}
                    </div>

                    {/* Published At Date */}
                    <div className="space-y-1">
                      <label htmlFor="news-date" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Publish Date
                      </label>
                      <input
                        id="news-date"
                        type="date"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.published_at?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.published_at[0]}</p>
                      )}
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="news-excerpt" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Short Excerpt / Summary
                      </label>
                      <textarea
                        id="news-excerpt"
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Short summary displayed on public cards and homepage listings..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.excerpt?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.excerpt[0]}</p>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="news-content" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Full Article Content
                      </label>
                      <textarea
                        id="news-content"
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Detailed news article body content..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.content?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.content[0]}</p>
                      )}
                    </div>

                    {/* Featured Image Upload & Preview */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Featured Header Image Upload <span className="text-slate-500 text-[10px] font-mono font-normal">(JPG, PNG, WebP ≤ 2MB)</span>
                      </label>

                      {/* Image Preview or File Picker */}
                      {(imagePreviewUrl || currentImageUrl) && !selectedImageFile ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-800 shrink-0">
                              <img
                                src={imagePreviewUrl || currentImageUrl || ""}
                                alt="News featured preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-200 block">Current Featured Image</span>
                              <span className="text-[10px] text-slate-500">Image attached to news article</span>
                            </div>
                          </div>

                          <label
                            htmlFor="news-image-file"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Replace Image
                          </label>
                        </div>
                      ) : selectedImageFile && imagePreviewUrl ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-500/50 bg-slate-800 shrink-0">
                              <img
                                src={imagePreviewUrl}
                                alt="New image preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="truncate max-w-xs">
                              <span className="text-xs font-semibold text-amber-300 block truncate">
                                {selectedImageFile.name}
                              </span>
                              <span className="text-[10px] text-amber-400/80">
                                ({(selectedImageFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveImageFile}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="news-image-file"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8" />
                            <path d="M15 18h-5" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to upload news cover photo / featured header image
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            PNG, JPG, WebP up to 2MB
                          </span>
                        </label>
                      )}

                      <input
                        id="news-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {validationErrors?.featured_image?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.featured_image[0]}</p>
                      )}
                    </div>

                    {/* SEO Metadata Section */}
                    <div className="space-y-3 sm:col-span-2 pt-2 border-t border-slate-800/80">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Search Engine Optimization (SEO Metadata)
                      </span>

                      <div className="space-y-1">
                        <label htmlFor="seo-title" className="block text-[11px] font-semibold text-slate-400">
                          SEO Title
                        </label>
                        <input
                          id="seo-title"
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Meta title for Google search results..."
                          className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="seo-desc" className="block text-[11px] font-semibold text-slate-400">
                          SEO Meta Description
                        </label>
                        <textarea
                          id="seo-desc"
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Meta description snippet for search engines..."
                          className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="pt-2 sm:col-span-2">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                        />
                        <span className="text-xs font-semibold text-slate-300">
                          Mark as Featured News Article
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
                      <span>{editingId ? "Update Article" : "Create Article"}</span>
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
                Are you sure you want to delete the news article{" "}
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
