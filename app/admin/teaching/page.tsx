"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { TeachingService } from "@/src/services/teaching.service";
import { TeachingCourse, TeachingPagination } from "@/src/types/teaching";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

const COMMON_LEVELS = [
  "Undergraduate",
  "Graduate",
  "Postgraduate",
  "Doctoral",
];

const COMMON_SEMESTERS = [
  "Fall",
  "Spring",
  "Summer",
  "Winter",
];

export default function AdminTeachingPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [courses, setCourses] = useState<TeachingCourse[]>([]);
  const [pagination, setPagination] = useState<TeachingPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [level, setLevel] = useState("Undergraduate");
  const [semester, setSemester] = useState("Fall");
  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [status, setStatus] = useState<string>("current");
  const [sortOrder, setSortOrder] = useState<number | string>(0);
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<TeachingCourse | null>(null);

  // Fetch Teaching Courses List
  const fetchTeachingsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await TeachingService.getAdminTeachings({
        search: searchQuery,
        level: levelFilter,
        status: statusFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setCourses(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch teaching courses list:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, levelFilter, statusFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchTeachingsList();
  }, [router, fetchTeachingsList]);

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

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setCourseName("");
    setCourseCode("");
    setLevel("Undergraduate");
    setSemester("Fall");
    setAcademicYear(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    setStatus("current");
    setSortOrder(0);
    setDescription("");
    setIsVisible(true);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: TeachingCourse) => {
    setEditingId(item.id);
    setCourseName(item.course_name || item.title || "");
    setCourseCode(item.course_code || item.code || "");
    setLevel(item.level || "Undergraduate");
    setSemester(item.semester || "Fall");
    setAcademicYear(item.academic_year || item.year || "");
    setStatus(item.status || "current");
    setSortOrder(item.sort_order ?? 0);
    setDescription(item.description || "");
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

    try {
      const payload: Partial<TeachingCourse> = {
        course_name: courseName,
        title: courseName,
        course_code: courseCode || null,
        code: courseCode || null,
        level: level || null,
        semester: semester || null,
        academic_year: academicYear || null,
        year: academicYear || null,
        status,
        sort_order: sortOrder ? parseInt(String(sortOrder), 10) : 0,
        description: description || null,
        is_visible: isVisible,
      };

      if (editingId) {
        await TeachingService.updateTeaching(editingId, payload);
        setSuccessMsg("Teaching course record updated successfully!");
      } else {
        await TeachingService.createTeaching(payload);
        setSuccessMsg("Teaching course record created successfully!");
      }

      setIsModalOpen(false);
      fetchTeachingsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save teaching course record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: TeachingCourse) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await TeachingService.deleteTeaching(deletingItem.id);
      setSuccessMsg(`Teaching course "${deletingItem.course_name || deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchTeachingsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete teaching course record.");
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
            Teaching & Courses Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage taught academic courses, course codes, study levels, academic years, and syllabus details.
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
          <span>Add Course</span>
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
        {/* Search Bar (course_name, course_code, description) */}
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
            placeholder="Search by course name, course code, or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Levels</option>
              {COMMON_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-slate-900 text-slate-200">
                  {lvl}
                </option>
              ))}
            </select>
          </div>

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
              <option value="current" className="bg-slate-900 text-slate-200">Current</option>
              <option value="previously_taught" className="bg-slate-900 text-slate-200">Previously Taught</option>
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
              <option value="course_name" className="bg-slate-900 text-slate-200">Course Name</option>
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
            Fetching teaching course records...
          </p>
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Teaching Courses Found"
          description={
            searchQuery || levelFilter || statusFilter || isVisibleFilter
              ? "No course records match your filter parameters. Try clearing your search filters."
              : "No teaching course records added yet. Click 'Add Course' to register one."
          }
        />
      ) : (
        /* Teaching Courses Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Course Name & Code</th>
                    <th className="py-4 px-6">Level</th>
                    <th className="py-4 px-6 text-center">Term & Academic Year</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Visibility</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {courses.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Course Name & Code */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center font-mono text-xs font-bold text-amber-400">
                            {(item.course_code || item.code || "CS").slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                              {item.course_name || item.title}
                            </div>
                            {(item.course_code || item.code) && (
                              <div className="text-slate-400 text-xs mt-0.5 font-mono">
                                Code: <span className="text-slate-200 font-semibold">{item.course_code || item.code}</span>
                              </div>
                            )}
                            {item.description && (
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                          {item.level || "Undergraduate"}
                        </span>
                      </td>

                      {/* Term & Academic Year */}
                      <td className="py-4 px-6 text-center whitespace-nowrap font-mono text-slate-300">
                        {item.semester ? `${item.semester} ` : ""}
                        {item.academic_year || item.year || "N/A"}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            item.status === "current"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {item.status === "current" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          {item.status === "current" ? "Current" : "Previously Taught"}
                        </span>
                      </td>

                      {/* Visibility Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            item.is_visible !== false
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
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
              className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950 z-10 my-auto flex flex-col overflow-hidden"
            >
              {/* Sticky Header */}
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                    {editingId ? "Edit Teaching Course Record" : "Add Teaching Course Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId
                      ? "Modify course code, name, academic year, or syllabus details."
                      : "Register a new taught course, code, level, and semester schedule."}
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
                    {/* Course Name */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="course-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Course Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="course-name"
                        type="text"
                        required
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="e.g. Advanced Artificial Intelligence & Deep Learning"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.course_name?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.course_name[0]}</p>
                      )}
                    </div>

                    {/* Course Code */}
                    <div className="space-y-1">
                      <label htmlFor="course-code" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Course Code
                      </label>
                      <input
                        id="course-code"
                        type="text"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="e.g. CS-701 or AI-502"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.course_code?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.course_code[0]}</p>
                      )}
                    </div>

                    {/* Level Selector */}
                    <div className="space-y-1">
                      <label htmlFor="course-level" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Academic Level
                      </label>
                      <select
                        id="course-level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                      >
                        {COMMON_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl} className="bg-slate-900 text-slate-200">
                            {lvl}
                          </option>
                        ))}
                      </select>
                      {validationErrors?.level?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.level[0]}</p>
                      )}
                    </div>

                    {/* Semester */}
                    <div className="space-y-1">
                      <label htmlFor="course-semester" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Semester / Term
                      </label>
                      <select
                        id="course-semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                      >
                        {COMMON_SEMESTERS.map((sem) => (
                          <option key={sem} value={sem} className="bg-slate-900 text-slate-200">
                            {sem}
                          </option>
                        ))}
                      </select>
                      {validationErrors?.semester?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.semester[0]}</p>
                      )}
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1">
                      <label htmlFor="course-year" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Academic Year
                      </label>
                      <input
                        id="course-year"
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="e.g. 2024-2025"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.academic_year?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.academic_year[0]}</p>
                      )}
                    </div>

                    {/* Status Options */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status Options
                      </label>
                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="teaching-status"
                            value="current"
                            checked={status === "current"}
                            onChange={() => setStatus("current")}
                            className="w-4 h-4 bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500/20"
                          />
                          <span className="text-xs text-slate-200 font-medium">Current</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="teaching-status"
                            value="previously_taught"
                            checked={status === "previously_taught"}
                            onChange={() => setStatus("previously_taught")}
                            className="w-4 h-4 bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500/20"
                          />
                          <span className="text-xs text-slate-200 font-medium">Previously Taught</span>
                        </label>
                      </div>
                      {validationErrors?.status?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.status[0]}</p>
                      )}
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-1">
                      <label htmlFor="course-sort" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Display Sort Order
                      </label>
                      <input
                        id="course-sort"
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.sort_order?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.sort_order[0]}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="course-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Course Description & Overview
                      </label>
                      <textarea
                        id="course-desc"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Course overview covering neural network optimization, transformer models, and hands-on lab projects..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.description?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
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
                      <span>{editingId ? "Update Course" : "Create Course"}</span>
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
                Are you sure you want to delete the teaching course{" "}
                <strong className="text-slate-100">"{deletingItem.course_name || deletingItem.title}"</strong>?
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
