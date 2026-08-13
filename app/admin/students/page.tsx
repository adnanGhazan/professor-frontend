"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { StudentService } from "@/src/services/student.service";
import { Student, StudentPagination } from "@/src/types/student";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

const COMMON_DEGREES = [
  "PhD Candidate",
  "PhD Graduate",
  "Master's Student (MSc)",
  "Master's Graduate (MSc)",
  "Undergraduate Researcher (BS)",
  "Postdoctoral Fellow",
  "Visiting Scholar",
];

export default function AdminStudentsPage() {
  const router = useRouter();

  // List Data & Pagination States
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<StudentPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isVisibleFilter, setIsVisibleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("start_year");
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
  const [studentName, setStudentName] = useState("");
  const [degree, setDegree] = useState("PhD Candidate");
  const [researchTitle, setResearchTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [startYear, setStartYear] = useState<number | string>(new Date().getFullYear());
  const [completionYear, setCompletionYear] = useState<number | string>("");
  const [status, setStatus] = useState<string>("current");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Image Load Fail Tracker
  const [failedImageIds, setFailedImageIds] = useState<Record<string | number, boolean>>({});

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<Student | null>(null);

  // Fetch Students List
  const fetchStudentsList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await StudentService.getAdminStudents({
        search: searchQuery,
        degree: degreeFilter,
        status: statusFilter,
        is_visible: isVisibleFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setStudents(data.items);
      setPagination(data.pagination);
      setFailedImageIds({});
    } catch (err: unknown) {
      console.error("Failed to fetch students list:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, degreeFilter, statusFilter, isVisibleFilter, sortBy, sortDir, currentPage]);

  // Auth check & initial fetch
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchStudentsList();
  }, [router, fetchStudentsList]);

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

  // Handle Photo selection and preview
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
    }
  };

  // Clear selected Photo file
  const handleRemovePhotoFile = () => {
    setSelectedPhotoFile(null);
    if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
  };

  // Reset & Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setStudentName("");
    setDegree("PhD Candidate");
    setResearchTitle("");
    setInstitution("");
    setStartYear(new Date().getFullYear());
    setCompletionYear("");
    setStatus("current");
    setDescription("");
    setIsVisible(true);
    setSelectedPhotoFile(null);
    setCurrentPhotoUrl(null);
    setPhotoPreviewUrl(null);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Pre-fill & Open Modal for Edit
  const handleOpenEditModal = (item: Student) => {
    setEditingId(item.id);
    setStudentName(item.student_name || "");
    setDegree(item.degree || "PhD Candidate");
    setResearchTitle(item.research_title || "");
    setInstitution(item.institution || "");
    setStartYear(item.start_year ?? new Date().getFullYear());
    setCompletionYear(item.completion_year ?? "");
    setStatus(item.status || "current");
    setDescription(item.description || "");
    setIsVisible(item.is_visible !== false);
    setSelectedPhotoFile(null);
    setCurrentPhotoUrl(item.photo_url || null);
    setPhotoPreviewUrl(null);
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
      setSelectedPhotoFile(null);
      setCurrentPhotoUrl(null);
      if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
      setPhotoPreviewUrl(null);
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
      if (selectedPhotoFile || editingId) {
        const formData = new FormData();
        formData.append("student_name", studentName);
        formData.append("degree", degree);
        if (researchTitle) formData.append("research_title", researchTitle);
        if (institution) formData.append("institution", institution);
        if (startYear) formData.append("start_year", String(startYear));
        if (status === "completed" && completionYear) {
          formData.append("completion_year", String(completionYear));
        } else if (status === "current" && completionYear) {
          formData.append("completion_year", String(completionYear));
        }
        formData.append("status", status);
        if (description) formData.append("description", description);
        formData.append("is_visible", isVisible ? "1" : "0");

        if (selectedPhotoFile) {
          formData.append("photo", selectedPhotoFile);
        }

        if (editingId) {
          // For multipart update support, use POST to /api/v1/students/{id}
          await StudentService.updateStudent(editingId, formData);
          setSuccessMsg("Student record updated successfully!");
        } else {
          await StudentService.createStudent(formData);
          setSuccessMsg("Student record created successfully!");
        }
      } else {
        // Plain JSON object creation without file
        const payload: Partial<Student> = {
          student_name: studentName,
          degree,
          research_title: researchTitle || null,
          institution: institution || null,
          start_year: startYear ? parseInt(String(startYear), 10) : null,
          completion_year: completionYear ? parseInt(String(completionYear), 10) : null,
          status,
          description: description || null,
          is_visible: isVisible,
        };

        if (editingId) {
          await StudentService.updateStudent(editingId, payload);
          setSuccessMsg("Student record updated successfully!");
        } else {
          await StudentService.createStudent(payload);
          setSuccessMsg("Student record created successfully!");
        }
      }

      setIsModalOpen(false);
      fetchStudentsList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save student record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (item: Student) => {
    setDeletingItem(item);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await StudentService.deleteStudent(deletingItem.id);
      setSuccessMsg(`Student record "${deletingItem.student_name}" deleted successfully!`);
      setDeletingItem(null);
      fetchStudentsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete student record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get Initials for Fallback Avatar
  const getInitials = (name: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Students & Supervision Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage PhD candidates, Master's students, researchers, alumni, and thesis supervision records.
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
          <span>Add Student</span>
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
        {/* Search Bar (student_name, degree, research_title, institution) */}
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
            placeholder="Search by student name, degree, thesis title, institution..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Degree Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Degree:</span>
            <input
              type="text"
              value={degreeFilter}
              onChange={(e) => {
                setDegreeFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. PhD"
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none w-24 placeholder-slate-600"
            />
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
              <option value="completed" className="bg-slate-900 text-slate-200">Completed (Alumni)</option>
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
              <option value="start_year" className="bg-slate-900 text-slate-200">Start Year</option>
              <option value="student_name" className="bg-slate-900 text-slate-200">Student Name</option>
              <option value="completion_year" className="bg-slate-900 text-slate-200">Completion Year</option>
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
            Fetching student & supervision records...
          </p>
        </div>
      ) : students.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Student Records Found"
          description={
            searchQuery || degreeFilter || statusFilter || isVisibleFilter
              ? "No student supervision records match your filter parameters. Try clearing your search filters."
              : "No student supervision records added yet. Click 'Add Student' to create one."
          }
        />
      ) : (
        /* Students Table */
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Degree & Institution</th>
                    <th className="py-4 px-6">Research Title</th>
                    <th className="py-4 px-6 text-center">Status & Timeline</th>
                    <th className="py-4 px-6 text-center">Visibility</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {students.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Student Name & Avatar */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-xs font-bold text-amber-400">
                            {item.photo_url && !failedImageIds[item.id] ? (
                              <img
                                src={item.photo_url}
                                alt={item.student_name}
                                className="h-full w-full object-cover"
                                onError={() => setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))}
                              />
                            ) : (
                              <span>{getInitials(item.student_name)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                              {item.student_name}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Degree & Institution */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.degree}
                        </span>
                        {item.institution && (
                          <div className="text-slate-400 text-xs mt-1">
                            {item.institution}
                          </div>
                        )}
                      </td>

                      {/* Research Title */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-slate-200 font-medium line-clamp-2 leading-snug">
                          {item.research_title || <span className="text-slate-600 italic">No research title specified</span>}
                        </div>
                      </td>

                      {/* Status & Timeline */}
                      <td className="py-4 px-6 text-center whitespace-nowrap space-y-1">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${item.status === "completed"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              }`}
                          >
                            {item.status === "completed" ? "✓ Completed (Alumni)" : "● Current Student"}
                          </span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {item.start_year || "N/A"} — {item.status === "current" ? "Present" : item.completion_year || "Present"}
                        </div>
                      </td>

                      {/* Visibility */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${item.is_visible !== false
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
                    {editingId ? "Edit Student Supervision Record" : "Add Student Supervision Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingId
                      ? "Modify student details, degree program, research thesis, or photo."
                      : "Register a new PhD candidate, Master's student, or research alumni."}
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
                    {/* Student Name */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="student-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Student Full Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="student-name"
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.student_name?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.student_name[0]}</p>
                      )}
                    </div>

                    {/* Degree */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="student-degree" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Degree Program / Title <span className="text-amber-400">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80"
                        >
                          {COMMON_DEGREES.map((d) => (
                            <option key={d} value={d} className="bg-slate-900 text-slate-200">
                              {d}
                            </option>
                          ))}
                          <option value="custom" className="bg-slate-900 text-amber-400">
                            Custom Degree...
                          </option>
                        </select>
                        <input
                          id="student-degree"
                          type="text"
                          required
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          placeholder="e.g. PhD in Computer Science"
                          className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      {validationErrors?.degree?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.degree[0]}</p>
                      )}
                    </div>

                    {/* Research Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="student-research" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Research Thesis Title / Focus
                      </label>
                      <input
                        id="student-research"
                        type="text"
                        value={researchTitle}
                        onChange={(e) => setResearchTitle(e.target.value)}
                        placeholder="e.g. Privacy-Preserving Federated Machine Learning Architectures"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.research_title?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.research_title[0]}</p>
                      )}
                    </div>

                    {/* Institution */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="student-institution" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        University / Institution Name
                      </label>
                      <input
                        id="student-institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.institution?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.institution[0]}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label htmlFor="student-status" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status <span className="text-amber-400">*</span>
                      </label>
                      <select
                        id="student-status"
                        required
                        value={status}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStatus(val);
                          if (val === "current") {
                            setCompletionYear("");
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="current" className="bg-slate-900 text-slate-200">
                          Current Student
                        </option>
                        <option value="completed" className="bg-slate-900 text-slate-200">
                          Completed (Alumni)
                        </option>
                      </select>
                      {validationErrors?.status?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.status[0]}</p>
                      )}
                    </div>

                    {/* Start Year */}
                    <div className="space-y-1">
                      <label htmlFor="student-start" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Start Year
                      </label>
                      <input
                        id="student-start"
                        type="number"
                        min="1900"
                        max="2100"
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                        placeholder="2022"
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.start_year?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.start_year[0]}</p>
                      )}
                    </div>

                    {/* Completion Year */}
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="student-completion" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Completion Year {status === "current" ? <span className="text-slate-500 font-normal lowercase">(optional — displays "Present" if blank)</span> : <span className="text-amber-400">*</span>}
                        </label>
                      </div>
                      <input
                        id="student-completion"
                        type="number"
                        min="1900"
                        max="2100"
                        value={completionYear}
                        onChange={(e) => setCompletionYear(e.target.value)}
                        placeholder={status === "current" ? "Present (leave blank or enter expected year)" : "2024"}
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                      />
                      {validationErrors?.completion_year?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.completion_year[0]}</p>
                      )}
                    </div>

                    {/* Description / Bio */}
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="student-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Bio / Short Description
                      </label>
                      <textarea
                        id="student-desc"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief summary of achievements, awards, or current position..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                      />
                      {validationErrors?.description?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                      )}
                    </div>

                    {/* Student Photo Upload & Preview */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Student Photo Upload <span className="text-slate-500 text-[10px] font-mono font-normal">(JPG, PNG, WebP ≤ 2MB)</span>
                      </label>

                      {/* Photo Preview or File Picker */}
                      {(photoPreviewUrl || currentPhotoUrl) && !selectedPhotoFile ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/30 bg-slate-800 shrink-0">
                              <img
                                src={photoPreviewUrl || currentPhotoUrl || ""}
                                alt="Student photo preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-200 block">Current Student Photo</span>
                              <span className="text-[10px] text-slate-500">Image attached to record</span>
                            </div>
                          </div>

                          <label
                            htmlFor="student-photo-file"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Replace Photo
                          </label>
                        </div>
                      ) : selectedPhotoFile && photoPreviewUrl ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/50 bg-slate-800 shrink-0">
                              <img
                                src={photoPreviewUrl}
                                alt="New photo preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="truncate max-w-xs">
                              <span className="text-xs font-semibold text-amber-300 block truncate">
                                {selectedPhotoFile.name}
                              </span>
                              <span className="text-[10px] text-amber-400/80">
                                ({(selectedPhotoFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemovePhotoFile}
                            className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="student-photo-file"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer text-center group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="10" r="3" />
                            <path d="M7 18.5c.4-2 2-3.5 5-3.5s4.6 1.5 5 3.5" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                            Click to upload student headshot photo
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            PNG, JPG, WebP up to 2MB
                          </span>
                        </label>
                      )}

                      <input
                        id="student-photo-file"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />

                      {validationErrors?.photo?.[0] && (
                        <p className="text-xs text-red-400 font-medium">{validationErrors.photo[0]}</p>
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
                      <span>{editingId ? "Update Student" : "Create Student"}</span>
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
                Are you sure you want to delete the student supervision record for{" "}
                <strong className="text-slate-100">"{deletingItem.student_name}"</strong>?
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
