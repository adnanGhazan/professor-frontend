"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { ResearchAreaService } from "@/src/services/research-area.service";
import { ResearchArea, ResearchAreaPagination } from "@/src/types/research-area";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminResearchAreasPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [pagination, setPagination] = useState<ResearchAreaPagination>({
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
  const [sortBy, setSortBy] = useState<string>("sort_order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
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
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number | string>(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<ResearchArea | null>(null);

  // Fetch Research Areas List
  const fetchResearchAreasList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await ResearchAreaService.getAdminResearchAreas({
        search: searchQuery,
        is_featured: isFeaturedFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setResearchAreas(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch research areas:", err);
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

    fetchResearchAreasList();
  }, [router, fetchResearchAreasList]);

  // Cleanup object URLs on change/unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle local image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
    }
  };

  // Clear selected image file
  const handleRemoveImageFile = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
  };

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setShortDescription("");
    setDescription("");
    setSortOrder(researchAreas.length + 1);
    setIsFeatured(false);
    setIsVisible(true);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: ResearchArea) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setShortDescription(item.short_description || "");
    setDescription(item.description || "");
    setSortOrder(item.sort_order ?? 1);
    setIsFeatured(Boolean(item.is_featured));
    setIsVisible(item.is_visible !== false);
    setSelectedImageFile(null);
    setImagePreviewUrl(item.image_url || null);
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
      // Build FormData if image is being uploaded/replaced or send FormData for multipart
      if (selectedImageFile || editingId) {
        const formData = new FormData();
        formData.append("title", title);
        if (slug) formData.append("slug", slug);
        if (shortDescription) formData.append("short_description", shortDescription);
        if (description) formData.append("description", description);
        formData.append("sort_order", String(sortOrder ? parseInt(String(sortOrder), 10) : 0));
        formData.append("is_featured", isFeatured ? "1" : "0");
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedImageFile) {
          formData.append("image", selectedImageFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/research-areas/{id}
          await ResearchAreaService.updateResearchArea(editingId, formData);
          setSuccessMsg("Research area updated successfully!");
        } else {
          await ResearchAreaService.createResearchArea(formData);
          setSuccessMsg("Research area created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<ResearchArea> = {
          title,
          slug: slug || undefined,
          short_description: shortDescription || null,
          description: description || null,
          sort_order: sortOrder ? parseInt(String(sortOrder), 10) : 0,
          is_featured: isFeatured,
          is_visible: isVisible,
        };

        if (editingId) {
          await ResearchAreaService.updateResearchArea(editingId, payload);
          setSuccessMsg("Research area updated successfully!");
        } else {
          await ResearchAreaService.createResearchArea(payload);
          setSuccessMsg("Research area created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchResearchAreasList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save research area.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: ResearchArea) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await ResearchAreaService.deleteResearchArea(deletingItem.id);
      setSuccessMsg(`Research area "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchResearchAreasList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete research area.");
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
            Research Areas Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic research domains, featured statuses, cover images, and visibility.
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
          <span>Add Research Area</span>
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
        {/* Search Bar */}
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
            placeholder="Search title, description, or slug..."
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
              <option value="sort_order" className="bg-slate-900 text-slate-200">Sort Order</option>
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
            Fetching research areas...
          </p>
        </div>
      ) : researchAreas.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Research Areas Found"
          description={
            searchQuery || isFeaturedFilter || isVisibleFilter
              ? "No records matching your search or filters. Try adjusting your query."
              : "No research areas defined yet. Click 'Add Research Area' to create one."
          }
        />
      ) : (
        /* Research Areas Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Title & Slug</th>
                    <th className="py-4 px-6">Short Description</th>
                    <th className="py-4 px-6 text-center">Featured</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Order</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {researchAreas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Image Thumbnail */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shadow-md bg-slate-950"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                              <path d="M2 12h20" />
                            </svg>
                          </div>
                        )}
                      </td>

                      {/* Title & Slug */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                          /{item.slug}
                        </div>
                      </td>

                      {/* Short Description */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-slate-300 line-clamp-2 leading-relaxed text-xs">
                          {item.short_description || <span className="text-slate-600 italic">No summary provided</span>}
                        </p>
                      </td>

                      {/* Featured Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            item.is_featured
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-slate-800/60 text-slate-500 border-slate-700/60"
                          }`}
                        >
                          {item.is_featured ? "★ Featured" : "Standard"}
                        </span>
                      </td>

                      {/* Visible Status Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            item.is_visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_visible !== false ? "bg-emerald-400" : "bg-slate-500"}`} />
                          {item.is_visible !== false ? "Visible" : "Hidden"}
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td className="py-4 px-6 text-center font-mono text-slate-300 font-semibold">
                        {item.sort_order ?? 1}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 overflow-hidden z-10 my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {editingId ? "Edit Research Area" : "Add Research Area"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? "Modify research area details, status, or image." : "Define a new academic research domain."}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitForm} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="area-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Title <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="area-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Artificial Intelligence & Deep Learning"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.title?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="area-slug" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Slug <span className="text-slate-500 text-[10px] font-mono font-normal">(Optional - auto-generated from title if blank)</span>
                    </label>
                    <input
                      id="area-slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="artificial-intelligence-deep-learning"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.slug?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.slug[0]}</p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="area-short-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Short Description
                    </label>
                    <textarea
                      id="area-short-desc"
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief overview highlight for card views and search indexes..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                    />
                    {validationErrors?.short_description?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.short_description[0]}</p>
                    )}
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="area-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Detailed Description
                    </label>
                    <textarea
                      id="area-desc"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Comprehensive overview of research topics, methods, and scope..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                    />
                    {validationErrors?.description?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                    )}
                  </div>

                  {/* Cover Image Upload & Preview */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Cover Image <span className="text-slate-500 text-[10px] font-mono font-normal">(JPEG, PNG, WEBP, SVG ≤ 2MB)</span>
                    </label>

                    {imagePreviewUrl ? (
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
                        <img
                          src={imagePreviewUrl}
                          alt="Research Area Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label
                            htmlFor="area-image-file"
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400 transition-colors"
                          >
                            Replace
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveImageFile}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="area-image-file"
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                          Click to select image file
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          PNG, JPG, WEBP, SVG up to 2MB
                        </span>
                      </label>
                    )}

                    <input
                      id="area-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {validationErrors?.image?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.image[0]}</p>
                    )}
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-1">
                    <label htmlFor="area-sortorder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Display Sort Order
                    </label>
                    <input
                      id="area-sortorder"
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.sort_order?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.sort_order[0]}</p>
                    )}
                  </div>

                  {/* Checkboxes: Featured & Visible */}
                  <div className="space-y-3 pt-4 sm:col-span-1 flex flex-col justify-center">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        Mark as Featured Area
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
                        Visible on Public Site
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
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
                      <span>{editingId ? "Update Area" : "Create Area"}</span>
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
                Are you sure you want to delete the research area{" "}
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
