"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { ResearchProjectService } from "@/src/services/research-project.service";
import { ResearchAreaService } from "@/src/services/research-area.service";
import { ResearchProject, ResearchProjectPagination } from "@/src/types/research-project";
import { ResearchArea } from "@/src/types/research-area";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminResearchProjectsPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [pagination, setPagination] = useState<ResearchProjectPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<string>("");
  const [isVisibleFilter, setIsVisibleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
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
  const [researchAreaId, setResearchAreaId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [projectType, setProjectType] = useState("research");
  const [fundingSource, setFundingSource] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<ResearchProject | null>(null);

  // Fetch Research Areas for Select Dropdowns
  const fetchResearchAreas = useCallback(async () => {
    try {
      const data = await ResearchAreaService.getAdminResearchAreas({ per_page: 100 });
      setResearchAreas(data.items);
    } catch (err) {
      console.error("Failed to load research areas list:", err);
    }
  }, []);

  // Fetch Research Projects List
  const fetchProjectsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await ResearchProjectService.getAdminResearchProjects({
        search: searchQuery,
        research_area_id: selectedAreaFilter,
        status: selectedStatusFilter,
        is_featured: isFeaturedFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setProjects(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch research projects:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedAreaFilter, selectedStatusFilter, isFeaturedFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchResearchAreas();
    fetchProjectsList();
  }, [router, fetchResearchAreas, fetchProjectsList]);

  // Cleanup blob URLs on change/unmount
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
    setResearchAreaId(researchAreas.length > 0 ? String(researchAreas[0].id) : "");
    setTitle("");
    setSlug("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setStatus("Ongoing");
    setProjectType("research");
    setFundingSource("");
    setProjectUrl("");
    setIsFeatured(false);
    setIsVisible(true);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: ResearchProject) => {
    setEditingId(item.id);
    setResearchAreaId(item.research_area_id ? String(item.research_area_id) : "");
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setDescription(item.description || "");
    setStartDate(item.start_date || "");
    setEndDate(item.end_date || "");
    setStatus(item.status || "Ongoing");
    setProjectType(item.project_type || "research");
    setFundingSource(item.funding_source || "");
    setProjectUrl(item.project_url || "");
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
      // If uploading file or editing, build FormData for multipart support
      if (selectedImageFile || editingId) {
        const formData = new FormData();
        if (researchAreaId) formData.append("research_area_id", researchAreaId);
        formData.append("title", title);
        if (slug) formData.append("slug", slug);
        if (description) formData.append("description", description);
        if (startDate) formData.append("start_date", startDate);
        if (endDate) formData.append("end_date", endDate);
        if (status) formData.append("status", status);
        if (projectType) formData.append("project_type", projectType);
        if (fundingSource) formData.append("funding_source", fundingSource);
        if (projectUrl) formData.append("project_url", projectUrl);
        formData.append("is_featured", isFeatured ? "1" : "0");
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedImageFile) {
          formData.append("image", selectedImageFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/research-projects/{id}
          await ResearchProjectService.updateResearchProject(editingId, formData);
          setSuccessMsg("Research project updated successfully!");
        } else {
          await ResearchProjectService.createResearchProject(formData);
          setSuccessMsg("Research project created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<ResearchProject> = {
          research_area_id: researchAreaId ? parseInt(researchAreaId, 10) : null,
          title,
          slug: slug || undefined,
          description: description || null,
          start_date: startDate || null,
          end_date: endDate || null,
          status: status || null,
          project_type: projectType || "research",
          funding_source: fundingSource || null,
          project_url: projectUrl || null,
          is_featured: isFeatured,
          is_visible: isVisible,
        };

        if (editingId) {
          await ResearchProjectService.updateResearchProject(editingId, payload);
          setSuccessMsg("Research project updated successfully!");
        } else {
          await ResearchProjectService.createResearchProject(payload);
          setSuccessMsg("Research project created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchProjectsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save research project.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: ResearchProject) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await ResearchProjectService.deleteResearchProject(deletingItem.id);
      setSuccessMsg(`Research project "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchProjectsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete research project.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    if (end) return `Until ${end}`;
    return "N/A";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Research Projects Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic grants, research initiatives, funding sources, timelines, and visibility.
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
          <span>Add Research Project</span>
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
            placeholder="Search project title, funding, description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Research Area Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Area:</span>
            <select
              value={selectedAreaFilter}
              onChange={(e) => {
                setSelectedAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Areas</option>
              {researchAreas.map((area) => (
                <option key={area.id} value={area.id} className="bg-slate-900 text-slate-200">
                  {area.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Statuses</option>
              <option value="Ongoing" className="bg-slate-900 text-slate-200">Ongoing</option>
              <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
              <option value="Proposed" className="bg-slate-900 text-slate-200">Proposed</option>
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
              <option value="created_at" className="bg-slate-900 text-slate-200">Created At</option>
              <option value="title" className="bg-slate-900 text-slate-200">Title</option>
              <option value="start_date" className="bg-slate-900 text-slate-200">Start Date</option>
              <option value="end_date" className="bg-slate-900 text-slate-200">End Date</option>
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
            Fetching research projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Research Projects Found"
          description={
            searchQuery || selectedAreaFilter || selectedStatusFilter || isFeaturedFilter || isVisibleFilter
              ? "No project records match your filter criteria. Try clearing your filters."
              : "No research projects created yet. Click 'Add Research Project' to create one."
          }
        />
      ) : (
        /* Research Projects Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Title & Funding</th>
                    <th className="py-4 px-6">Research Area</th>
                    <th className="py-4 px-6">Timeline & Status</th>
                    <th className="py-4 px-6 text-center">Featured</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {projects.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Thumbnail Image */}
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
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
                            </svg>
                          </div>
                        )}
                      </td>

                      {/* Title & Funding */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </div>
                        {item.funding_source && (
                          <div className="text-amber-400/90 text-xs mt-0.5 font-medium flex items-center gap-1">
                            <span>⚡ {item.funding_source}</span>
                          </div>
                        )}
                        {item.project_url && (
                          <a
                            href={item.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-[11px] mt-0.5 inline-block font-mono"
                          >
                            🔗 {item.project_url}
                          </a>
                        )}
                      </td>

                      {/* Research Area Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {item.research_area ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.research_area.title}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Timeline & Status Badge */}
                      <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-300">
                        <div>{formatDateRange(item.start_date, item.end_date)}</div>
                        {item.status && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                              {item.status}
                            </span>
                          </div>
                        )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
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
              className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950 z-10 flex flex-col overflow-hidden my-auto"
            >
              {/* Sticky Header */}
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {editingId ? "Edit Research Project" : "Add Research Project"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? "Modify grant details, status, or cover image." : "Register a new scientific research project entry."}
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
              <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 space-y-5 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Research Area Dropdown */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="proj-area" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Associated Research Area
                      </label>
                      <select
                        id="proj-area"
                        value={researchAreaId}
                        onChange={(e) => setResearchAreaId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Select Research Area (Optional)</option>
                        {researchAreas.map((area) => (
                          <option key={area.id} value={area.id} className="bg-slate-900 text-slate-200">
                            {area.title}
                          </option>
                        ))}
                      </select>
                      {validationErrors?.research_area_id?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.research_area_id[0]}</p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="proj-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Project Title <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="proj-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Autonomous Swarm Robotics for Search and Rescue"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="proj-slug" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Slug <span className="text-slate-500 text-[10px] font-mono font-normal">(Optional - auto-generated from title if blank)</span>
                      </label>
                      <input
                        id="proj-slug"
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="autonomous-swarm-robotics-search-and-rescue"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.slug?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.slug[0]}</p>
                      )}
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                      <label htmlFor="proj-start" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Start Date
                      </label>
                      <input
                        id="proj-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.start_date?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.start_date[0]}</p>
                      )}
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                      <label htmlFor="proj-end" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        End Date
                      </label>
                      <input
                        id="proj-end"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.end_date?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.end_date[0]}</p>
                      )}
                    </div>

                    {/* Project Type */}
                    <div className="space-y-1">
                      <label htmlFor="proj-type" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Project Type
                      </label>
                      <select
                        id="proj-type"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="research" className="bg-slate-900 text-slate-200">Research Project</option>
                        <option value="training" className="bg-slate-900 text-slate-200">Training Project</option>
                      </select>
                      {validationErrors?.project_type?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.project_type[0]}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label htmlFor="proj-status" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Project Status
                      </label>
                      <select
                        id="proj-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="Ongoing" className="bg-slate-900 text-slate-200">Ongoing</option>
                        <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
                        <option value="Proposed" className="bg-slate-900 text-slate-200">Proposed</option>
                      </select>
                      {validationErrors?.status?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.status[0]}</p>
                      )}
                    </div>

                    {/* Funding Source */}
                    <div className="space-y-1">
                      <label htmlFor="proj-funding" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Funding Source / Sponsor
                      </label>
                      <input
                        id="proj-funding"
                        type="text"
                        value={fundingSource}
                        onChange={(e) => setFundingSource(e.target.value)}
                        placeholder="e.g. National Science Foundation ($500K)"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.funding_source?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.funding_source[0]}</p>
                      )}
                    </div>

                    {/* Project URL */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="proj-url" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Project Website / External Repository URL
                      </label>
                      <input
                        id="proj-url"
                        type="url"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://github.com/lab/swarm-project"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.project_url?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.project_url[0]}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="proj-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Project Overview & Objectives
                      </label>
                      <textarea
                        id="proj-desc"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed overview of research objectives, methodologies, and outcomes..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.description?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                      )}
                    </div>

                    {/* Cover Image Upload & Preview */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Project Cover Image <span className="text-slate-500 text-[10px] font-mono font-normal">(JPEG, PNG, WEBP, SVG ≤ 2MB)</span>
                      </label>

                      {imagePreviewUrl ? (
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
                          <img
                            src={imagePreviewUrl}
                            alt="Project Cover Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label
                              htmlFor="proj-image-file"
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
                          htmlFor="proj-image-file"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to select cover image
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            PNG, JPG, WEBP, SVG up to 2MB
                          </span>
                        </label>
                      )}

                      <input
                        id="proj-image-file"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
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
                          Mark as Featured Project
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
                </div>

                {/* Sticky Action Footer */}
                <div className="shrink-0 flex items-center justify-end gap-3 p-4 sm:px-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
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
                      <span>{editingId ? "Update Project" : "Create Project"}</span>
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
                Are you sure you want to delete the research project{" "}
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
