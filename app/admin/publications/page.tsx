"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { PublicationService } from "@/src/services/publication.service";
import { ResearchAreaService } from "@/src/services/research-area.service";
import { Publication, PublicationPagination } from "@/src/types/publication";
import { ResearchArea } from "@/src/types/research-area";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

const PUBLICATION_TYPES = [
  "Journal Article",
  "Conference Paper",
  "Book Chapter",
  "Patent",
  "Technical Report",
  "Preprint",
  "Workshop Paper",
];

export default function AdminPublicationsPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [publications, setPublications] = useState<Publication[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [pagination, setPagination] = useState<PublicationPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<string>("");
  const [isVisibleFilter, setIsVisibleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("publication_year");
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
  const [authors, setAuthors] = useState("");
  const [publicationType, setPublicationType] = useState("Journal Article");
  const [journal, setJournal] = useState("");
  const [publicationYear, setPublicationYear] = useState<number | string>(new Date().getFullYear());
  const [publicationDate, setPublicationDate] = useState("");
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pages, setPages] = useState("");
  const [doi, setDoi] = useState("");
  const [abstract, setAbstract] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [citationCount, setCitationCount] = useState<number | string>(0);
  const [researchAreaId, setResearchAreaId] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<Publication | null>(null);

  // Fetch Research Areas for Select Dropdowns
  const fetchResearchAreas = useCallback(async () => {
    try {
      const data = await ResearchAreaService.getAdminResearchAreas({ per_page: 100 });
      setResearchAreas(data.items);
    } catch (err) {
      console.error("Failed to load research areas list:", err);
    }
  }, []);

  // Fetch Publications List
  const fetchPublicationsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await PublicationService.getAdminPublications({
        search: searchQuery,
        publication_type: typeFilter,
        publication_year: yearFilter,
        research_area_id: areaFilter,
        is_featured: isFeaturedFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setPublications(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch publications:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, typeFilter, yearFilter, areaFilter, isFeaturedFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchResearchAreas();
    fetchPublicationsList();
  }, [router, fetchResearchAreas, fetchPublicationsList]);

  // Prevent underlying page scrolling when modal is open
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

  // Handle PDF file selection
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPdfFile(file);
    }
  };

  // Clear selected PDF file
  const handleRemovePdfFile = () => {
    setSelectedPdfFile(null);
  };

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setAuthors("");
    setPublicationType("Journal Article");
    setJournal("");
    setPublicationYear(new Date().getFullYear());
    setPublicationDate("");
    setVolume("");
    setIssue("");
    setPages("");
    setDoi("");
    setAbstract("");
    setExternalUrl("");
    setCitationCount(0);
    setResearchAreaId("");
    setIsFeatured(false);
    setIsVisible(true);
    setSelectedPdfFile(null);
    setCurrentPdfUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: Publication) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setAuthors(item.authors || "");
    setPublicationType(item.publication_type || "Journal Article");
    setJournal(item.journal || "");
    setPublicationYear(item.publication_year ?? new Date().getFullYear());
    setPublicationDate(item.publication_date || "");
    setVolume(item.volume || "");
    setIssue(item.issue || "");
    setPages(item.pages || "");
    setDoi(item.doi || "");
    setAbstract(item.abstract || "");
    setExternalUrl(item.external_url || "");
    setCitationCount(item.citation_count ?? 0);
    setResearchAreaId(item.research_area_id ? String(item.research_area_id) : "");
    setIsFeatured(Boolean(item.is_featured));
    setIsVisible(item.is_visible !== false);
    setSelectedPdfFile(null);
    setCurrentPdfUrl(item.pdf_url || null);
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
      setSelectedPdfFile(null);
      setCurrentPdfUrl(null);
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
      // Build FormData when uploading PDF or editing for multipart support
      if (selectedPdfFile || editingId) {
        const formData = new FormData();
        formData.append("title", title);
        if (slug) formData.append("slug", slug);
        if (authors) formData.append("authors", authors);
        formData.append("publication_type", publicationType);
        if (journal) formData.append("journal", journal);
        if (publicationYear) formData.append("publication_year", String(publicationYear));
        if (publicationDate) formData.append("publication_date", publicationDate);
        if (volume) formData.append("volume", volume);
        if (issue) formData.append("issue", issue);
        if (pages) formData.append("pages", pages);
        if (doi) formData.append("doi", doi);
        if (abstract) formData.append("abstract", abstract);
        if (externalUrl) formData.append("external_url", externalUrl);
        formData.append("citation_count", String(citationCount ? parseInt(String(citationCount), 10) : 0));
        if (researchAreaId) formData.append("research_area_id", researchAreaId);
        formData.append("is_featured", isFeatured ? "1" : "0");
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedPdfFile) {
          formData.append("pdf_file", selectedPdfFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/publications/{id}
          await PublicationService.updatePublication(editingId, formData);
          setSuccessMsg("Publication record updated successfully!");
        } else {
          await PublicationService.createPublication(formData);
          setSuccessMsg("Publication record created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<Publication> = {
          title,
          slug: slug || undefined,
          authors: authors || null,
          publication_type: publicationType,
          journal: journal || null,
          publication_year: publicationYear ? parseInt(String(publicationYear), 10) : null,
          publication_date: publicationDate || null,
          volume: volume || null,
          issue: issue || null,
          pages: pages || null,
          doi: doi || null,
          abstract: abstract || null,
          external_url: externalUrl || null,
          citation_count: citationCount ? parseInt(String(citationCount), 10) : 0,
          research_area_id: researchAreaId ? parseInt(researchAreaId, 10) : null,
          is_featured: isFeatured,
          is_visible: isVisible,
        };

        if (editingId) {
          await PublicationService.updatePublication(editingId, payload);
          setSuccessMsg("Publication record updated successfully!");
        } else {
          await PublicationService.createPublication(payload);
          setSuccessMsg("Publication record created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchPublicationsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save publication record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: Publication) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await PublicationService.deletePublication(deletingItem.id);
      setSuccessMsg(`Publication "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchPublicationsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete publication record.");
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
            Publications Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic papers, journal articles, citations, PDF downloads, and research categories.
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
          <span>Add Publication</span>
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
        {/* Search Bar (title, authors, journal, doi) */}
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
            placeholder="Search by title, authors, journal, or DOI..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Publication Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Types</option>
              {PUBLICATION_TYPES.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-200">{t}</option>
              ))}
            </select>
          </div>

          {/* Publication Year Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Year:</span>
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. 2024"
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none w-20 placeholder-slate-600"
            />
          </div>

          {/* Research Area Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Area:</span>
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Areas</option>
              {researchAreas.map((area) => (
                <option key={area.id} value={area.id} className="bg-slate-900 text-slate-200">
                  {area.title}
                </option>
              ))}
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
              <option value="publication_year" className="bg-slate-900 text-slate-200">Year</option>
              <option value="title" className="bg-slate-900 text-slate-200">Title</option>
              <option value="publication_date" className="bg-slate-900 text-slate-200">Publication Date</option>
              <option value="citation_count" className="bg-slate-900 text-slate-200">Citation Count</option>
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
            Fetching publication records...
          </p>
        </div>
      ) : publications.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Publications Found"
          description={
            searchQuery || typeFilter || yearFilter || areaFilter || isFeaturedFilter || isVisibleFilter
              ? "No publication records match your filter parameters. Try clearing your filters."
              : "No publication records added yet. Click 'Add Publication' to register one."
          }
        />
      ) : (
        /* Publications Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Title & Authors</th>
                    <th className="py-4 px-6">Type & Journal</th>
                    <th className="py-4 px-6 text-center">Year & Date</th>
                    <th className="py-4 px-6 text-center">Citations</th>
                    <th className="py-4 px-6 text-center">PDF & Links</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {publications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Title, Authors & DOI */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors line-clamp-2">
                          {item.title}
                        </div>
                        {item.authors && (
                          <div className="text-slate-400 text-xs mt-0.5 line-clamp-1 italic">
                            {item.authors}
                          </div>
                        )}
                        {item.doi && (
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            DOI: <span className="text-slate-400">{item.doi}</span>
                          </div>
                        )}
                      </td>

                      {/* Type & Journal */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.publication_type}
                        </span>
                        {item.journal && (
                          <div className="text-slate-300 font-medium text-xs mt-1 max-w-xs truncate">
                            {item.journal}
                          </div>
                        )}
                        {item.research_area && (
                          <div className="text-slate-500 text-[10px] mt-0.5 font-mono">
                            Area: {item.research_area.title}
                          </div>
                        )}
                      </td>

                      {/* Year & Date */}
                      <td className="py-4 px-6 text-center whitespace-nowrap font-mono text-slate-300">
                        <div className="font-bold text-slate-100">{item.publication_year || "N/A"}</div>
                        {item.publication_date && (
                          <div className="text-slate-500 text-[10px]">{item.publication_date}</div>
                        )}
                      </td>

                      {/* Citations Count Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          🎓 {item.citation_count ?? 0}
                        </span>
                      </td>

                      {/* PDF & External Links */}
                      <td className="py-4 px-6 text-center whitespace-nowrap space-x-2">
                        {item.pdf_url ? (
                          <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[11px] font-mono font-semibold transition-colors"
                            title="Download PDF Document"
                          >
                            📄 PDF
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">No PDF</span>
                        )}

                        {item.external_url && (
                          <a
                            href={item.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-1.5 py-1 rounded-md bg-slate-800 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Open External URL"
                          >
                            🔗
                          </a>
                        )}
                      </td>

                      {/* Status Badges: Featured & Visible */}
                      <td className="py-4 px-6 text-center whitespace-nowrap space-y-1">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${item.is_featured
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-slate-800/60 text-slate-500 border-slate-700/60"
                              }`}
                          >
                            {item.is_featured ? "★ Featured" : "Standard"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${item.is_visible !== false
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
              className="relative w-full max-w-4xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950 z-10 my-auto flex flex-col overflow-hidden"
            >
              {/* Sticky Header */}
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                    {editingId ? "Edit Publication Record" : "Add Publication Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? "Modify academic publication details, citations, or PDF file." : "Register a new journal paper, conference proceeding, or book chapter."}
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
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="pub-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Paper / Publication Title <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="pub-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Deep Residual Learning for Image Recognition"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                      )}
                    </div>

                    {/* Authors */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="pub-authors" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Authors List
                      </label>
                      <input
                        id="pub-authors"
                        type="text"
                        value={authors}
                        onChange={(e) => setAuthors(e.target.value)}
                        placeholder="Alex Morgan, Kaiming He, Xiangyu Zhang, Shaoqing Ren"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.authors?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.authors[0]}</p>
                      )}
                    </div>

                    {/* Publication Type */}
                    <div className="space-y-1">
                      <label htmlFor="pub-type" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Publication Type <span className="text-amber-400">*</span>
                      </label>
                      <select
                        id="pub-type"
                        required
                        value={publicationType}
                        onChange={(e) => setPublicationType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      >
                        {PUBLICATION_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-slate-900 text-slate-200">
                            {t}
                          </option>
                        ))}
                      </select>
                      {validationErrors?.publication_type?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.publication_type[0]}</p>
                      )}
                    </div>

                    {/* Journal / Venue */}
                    <div className="space-y-1">
                      <label htmlFor="pub-journal" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Journal / Conference / Book Name
                      </label>
                      <input
                        id="pub-journal"
                        type="text"
                        value={journal}
                        onChange={(e) => setJournal(e.target.value)}
                        placeholder="IEEE Conference on Computer Vision & Pattern Recognition (CVPR)"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.journal?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.journal[0]}</p>
                      )}
                    </div>

                    {/* Publication Year */}
                    <div className="space-y-1">
                      <label htmlFor="pub-year" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Publication Year
                      </label>
                      <input
                        id="pub-year"
                        type="number"
                        min="1900"
                        max="2100"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        placeholder="2024"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.publication_year?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.publication_year[0]}</p>
                      )}
                    </div>

                    {/* Publication Date */}
                    <div className="space-y-1">
                      <label htmlFor="pub-date" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Exact Publication Date
                      </label>
                      <input
                        id="pub-date"
                        type="date"
                        value={publicationDate}
                        onChange={(e) => setPublicationDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.publication_date?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.publication_date[0]}</p>
                      )}
                    </div>

                    {/* Volume & Issue */}
                    <div className="space-y-1">
                      <label htmlFor="pub-volume" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Volume & Issue
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          id="pub-volume"
                          type="text"
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          placeholder="Vol 42"
                          className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                        />
                        <input
                          id="pub-issue"
                          type="text"
                          value={issue}
                          onChange={(e) => setIssue(e.target.value)}
                          placeholder="Issue 4"
                          className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                        />
                      </div>
                    </div>

                    {/* Pages & Citation Count */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="pub-pages" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Page Range
                          </label>
                          <input
                            id="pub-pages"
                            type="text"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            placeholder="770-778"
                            className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                          />
                        </div>
                        <div>
                          <label htmlFor="pub-citations" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Citations
                          </label>
                          <input
                            id="pub-citations"
                            type="number"
                            min="0"
                            value={citationCount}
                            onChange={(e) => setCitationCount(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                          />
                        </div>
                      </div>
                    </div>

                    {/* DOI */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="pub-doi" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        DOI Identifier
                      </label>
                      <input
                        id="pub-doi"
                        type="text"
                        value={doi}
                        onChange={(e) => setDoi(e.target.value)}
                        placeholder="10.1109/CVPR.2016.90"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.doi?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.doi[0]}</p>
                      )}
                    </div>

                    {/* Research Area Dropdown */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="pub-area" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Associated Research Area
                      </label>
                      <select
                        id="pub-area"
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

                    {/* External URL */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="pub-url" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        External Paper / Publisher URL
                      </label>
                      <input
                        id="pub-url"
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://doi.org/10.1109/CVPR.2016.90"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.external_url?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.external_url[0]}</p>
                      )}
                    </div>

                    {/* Abstract */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="pub-abstract" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Paper Abstract / Summary
                      </label>
                      <textarea
                        id="pub-abstract"
                        rows={4}
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        placeholder="Summary of scientific contributions, methodologies, and benchmarks..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.abstract?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.abstract[0]}</p>
                      )}
                    </div>

                    {/* PDF Document Upload & Current Link */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        PDF Document Upload <span className="text-slate-500 text-[10px] font-mono font-normal">(PDF file ≤ 10MB)</span>
                      </label>

                      {currentPdfUrl && !selectedPdfFile && (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <div className="flex items-center gap-2 text-emerald-300">
                            <span>📄 Current PDF attached</span>
                            <a
                              href={currentPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:underline font-mono ml-2 text-[11px]"
                            >
                              View PDF ↗
                            </a>
                          </div>
                          <label
                            htmlFor="pub-pdf-file"
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Replace PDF
                          </label>
                        </div>
                      )}

                      {selectedPdfFile && (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                          <span className="text-amber-300 font-mono font-medium truncate">
                            Selected: {selectedPdfFile.name} ({(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            onClick={handleRemovePdfFile}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold ml-2 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {!selectedPdfFile && !currentPdfUrl && (
                        <label
                          htmlFor="pub-pdf-file"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to select PDF document
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            PDF files up to 10MB
                          </span>
                        </label>
                      )}

                      <input
                        id="pub-pdf-file"
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfFileChange}
                        className="hidden"
                      />

                      {validationErrors?.pdf_file?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.pdf_file[0]}</p>
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
                          Mark as Featured Publication
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
                      <span>{editingId ? "Update Publication" : "Create Publication"}</span>
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
                Are you sure you want to delete the publication record{" "}
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
