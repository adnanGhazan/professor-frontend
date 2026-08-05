"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { EducationService } from "@/src/services/education.service";
import { Education, EducationPagination } from "@/src/types/education";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminEducationPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [educations, setEducations] = useState<Education[]>([]);
  const [pagination, setPagination] = useState<EducationPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Banners
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Form Fields State
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [institution, setInstitution] = useState("");
  const [location, setLocation] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number | string>(1);
  const [isVisible, setIsVisible] = useState(true);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<Education | null>(null);

  // Fetch Educations List
  const fetchEducationsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await EducationService.getAdminEducations({
        search: searchQuery,
        page: currentPage,
        per_page: 10,
      });
      setEducations(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch educations:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchEducationsList();
  }, [router, fetchEducationsList]);

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setDegree("");
    setField("");
    setInstitution("");
    setLocation("");
    setStartYear("");
    setEndYear("");
    setDescription("");
    setSortOrder(educations.length + 1);
    setIsVisible(true);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: Education) => {
    setEditingId(item.id);
    setDegree(item.degree || "");
    setField(item.field || "");
    setInstitution(item.institution || "");
    setLocation(item.location || "");
    setStartYear(item.start_year ? String(item.start_year) : "");
    setEndYear(item.end_year ? String(item.end_year) : "");
    setDescription(item.description || "");
    setSortOrder(item.sort_order ?? 1);
    setIsVisible(item.is_visible !== false);
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
    }
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors(null);

    const payload: Partial<Education> = {
      degree,
      field: field || null,
      institution,
      location: location || null,
      start_year: startYear ? parseInt(startYear, 10) : null,
      end_year: endYear ? parseInt(endYear, 10) : null,
      description: description || null,
      sort_order: sortOrder ? parseInt(String(sortOrder), 10) : 0,
      is_visible: isVisible,
    };

    try {
      if (editingId) {
        await EducationService.updateEducation(editingId, payload);
        setSuccessMsg("Education record updated successfully!");
      } else {
        await EducationService.createEducation(payload);
        setSuccessMsg("Education record created successfully!");
      }

      setIsModalOpen(false);
      fetchEducationsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save education record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: Education) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await EducationService.deleteEducation(deletingItem.id);
      setSuccessMsg(`Education record "${deletingItem.degree}" deleted successfully!`);
      setDeletingItem(null);
      fetchEducationsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete education record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatYears = (item: Education) => {
    if (item.start_year && item.end_year) return `${item.start_year} — ${item.end_year}`;
    if (item.end_year) return `Class of ${item.end_year}`;
    if (item.start_year) return `${item.start_year} — Present`;
    return "N/A";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Education Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic degrees, institutions, graduation dates, and visibility.
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
          <span>Add Education</span>
        </button>
      </div>

      {/* Success Alert Banner */}
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

      {/* General Error Alert Banner */}
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

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
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
            placeholder="Search by degree, institution, or field..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Total Records: <strong className="text-slate-200 font-bold">{pagination.total}</strong>
        </div>
      </div>

      {/* Loading Table State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-sm font-medium text-slate-400 animate-pulse font-mono">
            Fetching education records...
          </p>
        </div>
      ) : educations.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Education Records Found"
          description={
            searchQuery
              ? `No records matching "${searchQuery}". Try adjusting your search query.`
              : "No education records registered yet. Click 'Add Education' to create one."
          }
        />
      ) : (
        /* Education Table / Responsive Cards */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Degree & Field</th>
                    <th className="py-4 px-6">Institution & Location</th>
                    <th className="py-4 px-6">Years</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Order</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {educations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                          {item.degree}
                        </div>
                        {item.field && (
                          <div className="text-slate-400 text-xs mt-0.5">{item.field}</div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-200">{item.institution}</div>
                        {item.location && (
                          <div className="text-slate-500 text-[11px] mt-0.5">{item.location}</div>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-300">
                        {formatYears(item)}
                      </td>

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

                      <td className="py-4 px-6 text-center font-mono text-slate-400">
                        {item.sort_order ?? 1}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Delete Button */}
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

      {/* CREATE / EDIT MODAL */}
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
                    {editingId ? "Edit Education Record" : "Add Education Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? "Modify existing degree details and options." : "Create a new academic degree entry."}
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
                  {/* Degree */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="edu-degree" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Degree / Qualification <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="edu-degree"
                      type="text"
                      required
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="Ph.D. in Computer Science & Artificial Intelligence"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.degree?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.degree[0]}</p>
                    )}
                  </div>

                  {/* Field of Study */}
                  <div className="space-y-1">
                    <label htmlFor="edu-field" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Field of Study / Specialization
                    </label>
                    <input
                      id="edu-field"
                      type="text"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      placeholder="Machine Learning & Verification"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.field?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.field[0]}</p>
                    )}
                  </div>

                  {/* Institution */}
                  <div className="space-y-1">
                    <label htmlFor="edu-institution" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      University / Institution <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="edu-institution"
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Stanford University"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.institution?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.institution[0]}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="edu-location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Campus Location
                    </label>
                    <input
                      id="edu-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Stanford, CA, USA"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.location?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.location[0]}</p>
                    )}
                  </div>

                  {/* Start Year */}
                  <div className="space-y-1">
                    <label htmlFor="edu-startyear" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Start Year
                    </label>
                    <input
                      id="edu-startyear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      placeholder="2012"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.start_year?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.start_year[0]}</p>
                    )}
                  </div>

                  {/* End Year */}
                  <div className="space-y-1">
                    <label htmlFor="edu-endyear" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      End / Completion Year
                    </label>
                    <input
                      id="edu-endyear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      placeholder="2016"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.end_year?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.end_year[0]}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="edu-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Thesis Title / Summary Notes
                    </label>
                    <textarea
                      id="edu-description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Thesis title, advisor details, or academic honors..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                    />
                    {validationErrors?.description?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                    )}
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-1">
                    <label htmlFor="edu-sortorder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Display Sort Order
                    </label>
                    <input
                      id="edu-sortorder"
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

                  {/* Visibility Checkbox */}
                  <div className="space-y-1 flex items-center pt-5">
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
                      <span>{editingId ? "Update Record" : "Create Record"}</span>
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
                Are you sure you want to delete the education record for{" "}
                <strong className="text-slate-100">{deletingItem.degree}</strong> at{" "}
                <strong className="text-slate-100">{deletingItem.institution}</strong>?
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
