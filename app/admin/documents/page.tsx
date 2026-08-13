"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { DocumentService } from "@/src/services/document.service";
import { DocumentRecord, DocumentPagination } from "@/src/types/document";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminDocumentsPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [pagination, setPagination] = useState<DocumentPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
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
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("Syllabus");
  const [publishedAt, setPublishedAt] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<DocumentRecord | null>(null);

  // Fetch Documents List
  const fetchDocumentsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await DocumentService.getAdminDocuments({
        search: searchQuery,
        document_type: documentTypeFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setDocuments(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch documents list:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, documentTypeFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchDocumentsList();
  }, [router, fetchDocumentsList]);

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

  // File extension badge helper
  const getFileBadge = (ext?: string | null) => {
    const formatExt = (ext || "file").toLowerCase();
    let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
    let icon = "📄";

    if (formatExt === "pdf") {
      badgeStyle = "bg-red-500/10 text-red-400 border-red-500/30";
      icon = "📄";
    } else if (formatExt === "doc" || formatExt === "docx") {
      badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/30";
      icon = "📝";
    } else if (formatExt === "zip" || formatExt === "rar" || formatExt === "tar") {
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
      icon = "📦";
    } else if (formatExt === "ppt" || formatExt === "pptx") {
      badgeStyle = "bg-orange-500/10 text-orange-400 border-orange-500/30";
      icon = "📊";
    } else if (formatExt === "xls" || formatExt === "xlsx") {
      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      icon = "📊";
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${badgeStyle}`}>
        <span>{icon}</span>
        <span>{formatExt}</span>
      </span>
    );
  };

  // Handle Document File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle("");
    setDocumentType("Syllabus");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setDescription("");
    setIsVisible(true);
    setSelectedFile(null);
    setCurrentFileName(null);
    setCurrentFileUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: DocumentRecord) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDocumentType(item.document_type || "Syllabus");
    setPublishedAt(item.published_at ? item.published_at.slice(0, 10) : "");
    setDescription(item.description || "");
    setIsVisible(item.is_visible !== false);
    setSelectedFile(null);
    setCurrentFileName(item.file_name || (item.file ? item.file.split("/").pop() : null) || null);
    setCurrentFileUrl(item.file_url || null);
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
      setSelectedFile(null);
      setCurrentFileName(null);
      setCurrentFileUrl(null);
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
      if (selectedFile || editingId) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("document_type", documentType);
        if (publishedAt) formData.append("published_at", publishedAt);
        if (description) formData.append("description", description);
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/documents/{id}
          await DocumentService.updateDocument(editingId, formData);
          setSuccessMsg("Document record updated successfully!");
        } else {
          await DocumentService.createDocument(formData);
          setSuccessMsg("Document record created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<DocumentRecord> = {
          title,
          document_type: documentType,
          published_at: publishedAt || null,
          description: description || null,
          is_visible: isVisible,
        };

        if (editingId) {
          await DocumentService.updateDocument(editingId, payload);
          setSuccessMsg("Document record updated successfully!");
        } else {
          await DocumentService.createDocument(payload);
          setSuccessMsg("Document record created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchDocumentsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save document record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: DocumentRecord) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await DocumentService.deleteDocument(deletingItem.id);
      setSuccessMsg(`Document "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchDocumentsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete document record.");
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
            Course Resources & Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage course syllabi, lecture notes, lab manuals, curriculum vitae, research reports, and downloadable forms.
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
          <span>Add Document</span>
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
            placeholder="Search by title, description, or document type..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Document Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Type:</span>
            <select
              value={documentTypeFilter}
              onChange={(e) => {
                setDocumentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Types</option>
              <option value="Syllabus" className="bg-slate-900 text-slate-200">Syllabus</option>
              <option value="Lecture Notes" className="bg-slate-900 text-slate-200">Lecture Notes</option>
              <option value="CV / Bio" className="bg-slate-900 text-slate-200">CV / Bio</option>
              <option value="Lab Manual" className="bg-slate-900 text-slate-200">Lab Manual</option>
              <option value="Form" className="bg-slate-900 text-slate-200">Form</option>
              <option value="Report" className="bg-slate-900 text-slate-200">Report</option>
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
              <option value="published_at" className="bg-slate-900 text-slate-200">Published At</option>
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
            Fetching documents...
          </p>
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Documents Found"
          description={
            searchQuery || documentTypeFilter || isVisibleFilter
              ? "No document records match your filter parameters. Try clearing your search filters."
              : "No document records created yet. Click 'Add Document' to upload one."
          }
        />
      ) : (
        /* Documents Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Document & File Type</th>
                    <th className="py-4 px-6">Document Type</th>
                    <th className="py-4 px-6 text-center">File Link</th>
                    <th className="py-4 px-6 text-center">Published Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {documents.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Title & File Extension Badge */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            {getFileBadge(item.file_extension)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                              {item.title}
                            </div>
                            {item.description ? (
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </div>
                            ) : item.file_name ? (
                              <div className="text-[11px] font-mono text-slate-500 mt-0.5 line-clamp-1">
                                {item.file_name}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Document Type Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-amber-400 border border-amber-500/20">
                          {item.document_type || "General"}
                        </span>
                      </td>

                      {/* Download Link */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {item.file_url ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>📥 Download</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[11px] font-mono">—</span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td className="py-4 px-6 text-center whitespace-nowrap font-mono text-slate-300">
                        {item.published_at ? item.published_at.slice(0, 10) : "N/A"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            item.is_visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
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
                    {editingId ? "Edit Document Record" : "Add Document Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId
                      ? "Modify document title, type, publish date, description, or replacement file."
                      : "Upload a new course syllabus, lecture notes, lab manual, or downloadable PDF."}
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
                    {/* Document Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="document-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Document Title <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="document-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. CS-701 Advanced Machine Learning Syllabus (Spring 2026)"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                      )}
                    </div>

                    {/* Document Type */}
                    <div className="space-y-1">
                      <label htmlFor="document-type" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Document Type <span className="text-amber-400">*</span>
                      </label>
                      <select
                        id="document-type"
                        required
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                      >
                        <option value="Syllabus" className="bg-slate-900 text-slate-200">Syllabus</option>
                        <option value="Lecture Notes" className="bg-slate-900 text-slate-200">Lecture Notes</option>
                        <option value="CV / Bio" className="bg-slate-900 text-slate-200">CV / Bio</option>
                        <option value="Lab Manual" className="bg-slate-900 text-slate-200">Lab Manual</option>
                        <option value="Form" className="bg-slate-900 text-slate-200">Form</option>
                        <option value="Report" className="bg-slate-900 text-slate-200">Report</option>
                      </select>
                      {validationErrors?.document_type?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.document_type[0]}</p>
                      )}
                    </div>

                    {/* Published Date */}
                    <div className="space-y-1">
                      <label htmlFor="document-published-at" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Published Date
                      </label>
                      <input
                        id="document-published-at"
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
                      <label htmlFor="document-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Document Summary / Description
                      </label>
                      <textarea
                        id="document-description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Overview of the document content, target course, or instructions..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.description?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                      )}
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Document File Upload {!editingId && <span className="text-amber-400">*</span>}{" "}
                        <span className="text-slate-500 text-[10px] font-mono font-normal">(PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, ZIP ≤ 10MB)</span>
                      </label>

                      {/* File Selection / Current File Card */}
                      {currentFileName && !selectedFile ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                              📄
                            </div>
                            <div className="truncate max-w-xs">
                              <span className="text-xs font-medium text-slate-200 block truncate">
                                {currentFileName}
                              </span>
                              {currentFileUrl && (
                                <a
                                  href={currentFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-amber-400 hover:underline"
                                >
                                  Download / View Current File ↗
                                </a>
                              )}
                            </div>
                          </div>

                          <label
                            htmlFor="document-file-input"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Replace File
                          </label>
                        </div>
                      ) : selectedFile ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg text-amber-400 shrink-0">
                              📁
                            </div>
                            <div className="truncate max-w-xs">
                              <span className="text-xs font-semibold text-amber-300 block truncate">
                                {selectedFile.name}
                              </span>
                              <span className="text-[10px] text-amber-400/80 font-mono">
                                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="document-file-input"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                            <path d="M14 2v4a1 1 0 0 0 1 1h4" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to upload PDF, Word document, slides, or spreadsheet
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1 font-mono">
                            PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, ZIP up to 10MB
                          </span>
                        </label>
                      )}

                      <input
                        id="document-file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {validationErrors?.file?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.file[0]}</p>
                      )}
                    </div>

                    {/* Visibility Checkbox */}
                    <div className="pt-2 sm:col-span-2">
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
                      <span>{editingId ? "Update Document" : "Create Document"}</span>
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
                Are you sure you want to delete the document{" "}
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
