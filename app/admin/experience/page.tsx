"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { ExperienceService } from "@/src/services/experience.service";
import { Experience, ExperiencePagination } from "@/src/types/experience";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminExperiencePage() {
  const router = useRouter();

  // List Data & Pagination States
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [pagination, setPagination] = useState<ExperiencePagination>({
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
  const [position, setPosition] = useState("");
  const [institution, setInstitution] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number | string>(1);
  const [isVisible, setIsVisible] = useState(true);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<Experience | null>(null);

  // Fetch Experiences List
  const fetchExperiencesList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await ExperienceService.getAdminExperiences({
        search: searchQuery,
        page: currentPage,
        per_page: 10,
      });
      setExperiences(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch experiences:", err);
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

    fetchExperiencesList();
  }, [router, fetchExperiencesList]);

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setPosition("");
    setInstitution("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setDescription("");
    setSortOrder(experiences.length + 1);
    setIsVisible(true);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: Experience) => {
    setEditingId(item.id);
    setPosition(item.position || item.role || "");
    setInstitution(item.institution || item.organization || "");
    setLocation(item.location || "");
    setStartDate(item.start_date || "");
    setEndDate(item.end_date || "");
    setIsCurrent(Boolean(item.is_current));
    setDescription(item.description || (Array.isArray(item.responsibilities) ? item.responsibilities.join("\n") : item.responsibilities || ""));
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

    const payload: Partial<Experience> = {
      position,
      institution,
      location: location || null,
      start_date: startDate || null,
      end_date: isCurrent ? null : endDate || null,
      is_current: isCurrent,
      description: description || null,
      sort_order: sortOrder ? parseInt(String(sortOrder), 10) : 0,
      is_visible: isVisible,
    };

    try {
      if (editingId) {
        await ExperienceService.updateExperience(editingId, payload);
        setSuccessMsg("Experience record updated successfully!");
      } else {
        await ExperienceService.createExperience(payload);
        setSuccessMsg("Experience record created successfully!");
      }

      setIsModalOpen(false);
      fetchExperiencesList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save experience record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await ExperienceService.deleteExperience(deletingItem.id);
      setSuccessMsg(`Experience record "${deletingItem.position}" deleted successfully!`);
      setDeletingItem(null);
      fetchExperiencesList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete experience record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPeriod = (item: Experience) => {
    if (item.period) return item.period;
    const start = item.start_date ? item.start_date.substring(0, 4) : "";
    const end = item.is_current ? "Present" : item.end_date ? item.end_date.substring(0, 4) : "Present";
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    return "Career Position";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Experience Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic appointments, research leadership, and industry positions.
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
          <span>Add Experience</span>
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

      {/* Search Bar Input */}
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
            placeholder="Search by position, institution, or location..."
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
            Fetching experience records...
          </p>
        </div>
      ) : experiences.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Experience Records Found"
          description={
            searchQuery
              ? `No records matching "${searchQuery}". Try adjusting your search query.`
              : "No professional experience records registered yet. Click 'Add Experience' to create one."
          }
        />
      ) : (
        /* Experience Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Position & Institution</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Period</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Order</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {experiences.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                          {item.position || item.role}
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5 font-medium">
                          {item.institution || item.organization}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {item.location || "N/A"}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-300">
                        <div className="flex items-center gap-2">
                          <span>{formatPeriod(item)}</span>
                          {item.is_current && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                              Current
                            </span>
                          )}
                        </div>
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
                          onClick={() => setDeletingItem(item)}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 overflow-hidden z-10 my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {editingId ? "Edit Experience Record" : "Add Experience Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId ? "Modify existing career appointment details." : "Create a new professional appointment entry."}
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

              <form onSubmit={handleSubmitForm} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Position / Title */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="exp-position" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Position / Academic Role <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="exp-position"
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Full Professor & Chair of Artificial Intelligence"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.position?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.position[0]}</p>
                    )}
                  </div>

                  {/* Institution / Organization */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="exp-institution" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Institution / Department / Organization <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="exp-institution"
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Department of Computer Science / Google DeepMind"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.institution?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.institution[0]}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="exp-location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Location
                    </label>
                    <input
                      id="exp-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Main University Campus / Mountain View, CA"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.location?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.location[0]}</p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1">
                    <label htmlFor="exp-startdate" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      id="exp-startdate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.start_date?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.start_date[0]}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label htmlFor="exp-enddate" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      End Date {isCurrent && <span className="text-amber-400 font-normal">(Optional — Current Role)</span>}
                    </label>
                    <input
                      id="exp-enddate"
                      type="date"
                      disabled={isCurrent}
                      value={isCurrent ? "" : endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    {validationErrors?.end_date?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.end_date[0]}</p>
                    )}
                  </div>

                  {/* Current Position Toggle */}
                  <div className="space-y-1 sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isCurrent}
                        onChange={(e) => setIsCurrent(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-semibold text-amber-300">
                        This is my current active position (End Date will show as &quot;Present&quot;)
                      </span>
                    </label>
                  </div>

                  {/* Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="exp-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Responsibilities & Key Accomplishments
                    </label>
                    <textarea
                      id="exp-description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter responsibilities or key highlights (separate with newlines for bullet points)..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                    />
                    {validationErrors?.description?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                    )}
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-1">
                    <label htmlFor="exp-sortorder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Display Sort Order
                    </label>
                    <input
                      id="exp-sortorder"
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
                Are you sure you want to delete the experience record for{" "}
                <strong className="text-slate-100">{deletingItem.position || deletingItem.role}</strong> at{" "}
                <strong className="text-slate-100">{deletingItem.institution || deletingItem.organization}</strong>?
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
