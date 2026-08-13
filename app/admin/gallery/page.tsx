"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { GalleryService } from "@/src/services/gallery.service";
import { GalleryItem, GalleryPagination } from "@/src/types/gallery";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminGalleryPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [pagination, setPagination] = useState<GalleryPagination>({
    total: 0,
    count: 0,
    per_page: 12,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
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

  // Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Image Load Fail Tracker
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);

  // Fetch Gallery List
  const fetchGalleryList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await GalleryService.getAdminGallery({
        search: searchQuery,
        category: categoryFilter,
        is_featured: isFeaturedFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 12,
      });
      setItems(data.items);
      setPagination(data.pagination);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to fetch gallery list:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, categoryFilter, isFeaturedFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchGalleryList();
  }, [router, fetchGalleryList]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || deletingItem || lightboxImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, deletingItem, lightboxImage]);

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
    setCategory("");
    setEventDate(new Date().toISOString().slice(0, 10));
    setSortOrder(0);
    setDescription("");
    setIsFeatured(false);
    setIsVisible(true);
    setSelectedImageFile(null);
    setCurrentImageUrl(null);
    setImagePreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setCategory(item.category || "");
    setEventDate(item.event_date ? item.event_date.slice(0, 10) : "");
    setSortOrder(item.sort_order ?? 0);
    setDescription(item.description || "");
    setIsFeatured(Boolean(item.is_featured));
    setIsVisible(item.is_visible !== false);
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
        if (title) formData.append("title", title);
        if (category) formData.append("category", category);
        if (eventDate) formData.append("event_date", eventDate);
        formData.append("sort_order", sortOrder.toString());
        if (description) formData.append("description", description);
        formData.append("is_featured", isFeatured ? "1" : "0");
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedImageFile) {
          formData.append("image", selectedImageFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/gallery/{id}
          await GalleryService.updateGalleryItem(editingId, formData);
          setSuccessMsg("Gallery item updated successfully!");
        } else {
          await GalleryService.createGalleryItem(formData);
          setSuccessMsg("Gallery item created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<GalleryItem> = {
          title: title || null,
          category: category || null,
          event_date: eventDate || null,
          sort_order: sortOrder,
          description: description || null,
          is_featured: isFeatured,
          is_visible: isVisible,
        };

        if (editingId) {
          await GalleryService.updateGalleryItem(editingId, payload);
          setSuccessMsg("Gallery item updated successfully!");
        } else {
          await GalleryService.createGalleryItem(payload);
          setSuccessMsg("Gallery item created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchGalleryList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save gallery item.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: GalleryItem) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await GalleryService.deleteGalleryItem(deletingItem.id);
      setSuccessMsg(`Gallery item deleted successfully!`);
      setDeletingItem(null);
      fetchGalleryList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete gallery item.");
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
            Photo Gallery & Event Media
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic event photos, research lab activities, campus lectures, and ceremony media.
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
          <span>Add Gallery Item</span>
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
            placeholder="Search by title, description, or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Category:</span>
            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="All categories"
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none w-28 placeholder-slate-600"
            />
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
              <option value="event_date" className="bg-slate-900 text-slate-200">Event Date</option>
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

      {/* Loading Grid State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-sm font-medium text-slate-400 animate-pulse font-mono">
            Fetching gallery items...
          </p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Gallery Items Found"
          description={
            searchQuery || categoryFilter || isFeaturedFilter || isVisibleFilter
              ? "No gallery records match your filter parameters. Try clearing your search filters."
              : "No gallery records added yet. Click 'Add Gallery Item' to upload one."
          }
        />
      ) : (
        /* Gallery Image-Card Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all group flex flex-col justify-between"
              >
                {/* Image Container with Aspect Ratio */}
                <div
                  className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => setLightboxImage(item)}
                >
                  {item.image_url && !failedImageIds[item.id] ? (
                    <img
                      src={item.image_url}
                      alt={item.title || "Gallery Item"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-600 text-3xl">
                      🖼️
                      <span className="text-[10px] text-slate-600 font-mono mt-1">No Image Available</span>
                    </div>
                  )}

                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <div className="flex items-center gap-1.5">
                      {item.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                          ★ Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border backdrop-blur-md ${
                          item.is_visible !== false
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-800/80 text-slate-400 border-slate-700"
                        }`}
                      >
                        {item.is_visible !== false ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950/80 text-slate-300 border border-slate-800">
                      Order: {item.sort_order ?? 0}
                    </span>
                  </div>
                </div>

                {/* Card Body Content */}
                <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-amber-400 font-semibold truncate max-w-[140px]">
                        {item.category || "Uncategorized"}
                      </span>
                      <span>{item.event_date ? item.event_date.slice(0, 10) : "No Date"}</span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {item.title || "Untitled Gallery Photo"}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setLightboxImage(item)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔍 Preview</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm(item)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
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

      {/* IMAGE LIGHTBOX PREVIEW MODAL */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 space-y-4 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {lightboxImage.title || "Gallery Item Preview"}
                  </h3>
                  <span className="text-[11px] font-mono text-amber-400">
                    {lightboxImage.category || "General"} — {lightboxImage.event_date ? lightboxImage.event_date.slice(0, 10) : "No Date"}
                  </span>
                </div>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Full Image Preview Container */}
              <div className="relative w-full max-h-[70vh] flex items-center justify-center bg-black rounded-2xl overflow-hidden border border-slate-800">
                {lightboxImage.image_url ? (
                  <img
                    src={lightboxImage.image_url}
                    alt={lightboxImage.title || "Full Preview"}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                ) : (
                  <div className="p-12 text-slate-500 font-mono text-xs">No Image Available</div>
                )}
              </div>

              {lightboxImage.description && (
                <p className="text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar pt-1">
                  {lightboxImage.description}
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
                    {editingId ? "Edit Gallery Item" : "Add Gallery Item"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId
                      ? "Modify photo title, category, event date, description, or replacement image."
                      : "Upload a new event photograph or lab photo to the public gallery."}
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
                    {/* Item Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="gallery-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Photo Title
                      </label>
                      <input
                        id="gallery-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. World AI Summit Keynote Presentation & Panel"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label htmlFor="gallery-category" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Category / Tag
                      </label>
                      <input
                        id="gallery-category"
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Conferences, Lab Events, Workshops"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.category?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.category[0]}</p>
                      )}
                    </div>

                    {/* Event Date */}
                    <div className="space-y-1">
                      <label htmlFor="gallery-event-date" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Event Date
                      </label>
                      <input
                        id="gallery-event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.event_date?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.event_date[0]}</p>
                      )}
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="gallery-sort-order" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Sort Order <span className="text-slate-500 text-[10px] font-mono font-normal">(Lower numbers display first, e.g. 0, 1, 2)</span>
                      </label>
                      <input
                        id="gallery-sort-order"
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.sort_order?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.sort_order[0]}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="gallery-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Photo Description / Caption
                      </label>
                      <textarea
                        id="gallery-description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Event summary, photo caption, or lab activity notes..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.description?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                      )}
                    </div>

                    {/* Image Upload & Preview */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Gallery Photo Upload {!editingId && <span className="text-amber-400">*</span>}{" "}
                        <span className="text-slate-500 text-[10px] font-mono font-normal">(PNG, JPG, WebP ≤ 2MB)</span>
                      </label>

                      {/* Image Preview or File Picker */}
                      {(imagePreviewUrl || currentImageUrl) && !selectedImageFile ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-800 shrink-0">
                              <img
                                src={imagePreviewUrl || currentImageUrl || ""}
                                alt="Gallery preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-200 block">Current Photo</span>
                              <span className="text-[10px] text-slate-500">Image attached to gallery item</span>
                            </div>
                          </div>

                          <label
                            htmlFor="gallery-image-file"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Replace Image
                          </label>
                        </div>
                      ) : selectedImageFile && imagePreviewUrl ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-amber-500/50 bg-slate-800 shrink-0">
                              <img
                                src={imagePreviewUrl}
                                alt="New preview"
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
                          htmlFor="gallery-image-file"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to upload event or lab photograph
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            PNG, JPG, WebP up to 2MB
                          </span>
                        </label>
                      )}

                      <input
                        id="gallery-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {validationErrors?.image?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.image[0]}</p>
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
                          Mark as Featured Photo
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
                      <span>{editingId ? "Update Item" : "Create Item"}</span>
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
                Are you sure you want to delete this gallery photo{" "}
                {deletingItem.title && <strong className="text-slate-100">"{deletingItem.title}"</strong>}?
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
