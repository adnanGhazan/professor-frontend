"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { MeetingRequestService } from "@/src/services/meeting-request.service";
import { MeetingRequest, MeetingRequestPagination } from "@/src/types/meeting-request";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminMeetingRequestsPage() {
  const router = useRouter();

  // List & Pagination States
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [pagination, setPagination] = useState<MeetingRequestPagination>({
    total: 0,
    count: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 1,
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Loading & Alert States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detail / Edit Modal State
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState<MeetingRequest | null>(null);

  // Check auth session
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  // Fetch Meeting Requests List
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await MeetingRequestService.getAdminMeetingRequests({
        search: searchQuery,
        status: statusFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        per_page: 10,
      });
      setMeetingRequests(data.items);
      setPagination(data.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch meeting requests:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy, sortDir, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open Detail / Edit Modal
  const handleOpenDetailModal = (req: MeetingRequest) => {
    setSelectedRequest(req);
    setEditStatus(req.status || "pending");
    setEditAdminNotes(req.admin_notes || "");
  };

  const handleCloseDetailModal = () => {
    if (isSubmitting) return;
    setSelectedRequest(null);
  };

  // Update Status / Admin Notes
  const handleUpdateStatusAndNotes = async (
    targetStatus?: string,
    targetNotes?: string
  ) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newStatus = targetStatus || editStatus;
    const newNotes = targetNotes !== undefined ? targetNotes : editAdminNotes;

    try {
      const updated = await MeetingRequestService.updateMeetingRequest(selectedRequest.id, {
        status: newStatus,
        admin_notes: newNotes,
      });

      setSuccessMsg(`Meeting request status updated to "${newStatus}".`);
      setSelectedRequest(updated);

      // Refresh list item locally
      setMeetingRequests((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update meeting request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Toggle from Table
  const handleQuickStatusChange = async (req: MeetingRequest, newStatus: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await MeetingRequestService.updateMeetingRequest(req.id, {
        status: newStatus,
      });
      setSuccessMsg(`Request #${req.id} status updated to "${newStatus}".`);
      setMeetingRequests((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Request
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await MeetingRequestService.deleteMeetingRequest(deletingItem.id);
      setSuccessMsg(`Meeting request #${deletingItem.id} deleted successfully.`);
      setDeletingItem(null);
      if (selectedRequest?.id === deletingItem.id) {
        setSelectedRequest(null);
      }
      fetchRequests();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete meeting request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge Status Styling
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (s === "rejected") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  // Summary statistics
  const pendingCount = meetingRequests.filter((r) => r.status === "pending").length;
  const approvedCount = meetingRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = meetingRequests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <svg
              className="w-6 h-6 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Meeting Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, approve, reject, and manage consultation requests submitted by public visitors.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/60 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Global Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              ✕
            </button>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-200"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stat Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Requests</span>
          <span className="text-2xl font-bold text-slate-100 mt-1">{pagination.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Pending</span>
          <span className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Approved</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[11px] font-medium text-red-400 uppercase tracking-wider">Rejected</span>
          <span className="text-2xl font-bold text-red-400 mt-1">{rejectedCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by requester name, email, country, purpose..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-950/80 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950/80 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50"
          >
            <option value="created_at">Date Submitted</option>
            <option value="preferred_date">Preferred Date</option>
            <option value="status">Status</option>
            <option value="full_name">Requester Name</option>
          </select>

          {/* Sort Direction Toggle */}
          <button
            onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="p-2 text-xs bg-slate-950/80 text-slate-300 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
            title={`Sort ${sortDir === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      {/* Main Table / Content Section */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" variant="primary" />
            <p className="text-xs text-slate-400 mt-3">Loading meeting requests...</p>
          </div>
        ) : meetingRequests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Meeting Requests Found"
              description={
                searchQuery || statusFilter
                  ? "No requests match your search filter criteria. Try clearing search parameters."
                  : "No public meeting requests have been submitted yet."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Requester</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold">Meeting Details</th>
                  <th className="py-3.5 px-4 font-semibold">Preferred Date</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {meetingRequests.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetailModal(item)}
                  >
                    {/* Requester Column */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {item.full_name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.affiliation || "Independent / N/A"} • <span className="text-slate-300">{item.country}</span>
                      </div>
                    </td>

                    {/* Contact Info Column */}
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="text-slate-200 font-mono text-[11px]">{item.email}</div>
                      {item.phone && (
                        <div className="text-slate-400 text-[11px]">{item.phone}</div>
                      )}
                    </td>

                    {/* Meeting Details Column */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-200">{item.meeting_purpose}</div>
                      <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                        Duration: {item.duration} Minutes
                      </div>
                    </td>

                    {/* Preferred Date Column */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-200">
                        {item.preferred_date ? new Date(item.preferred_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) : "N/A"}
                      </div>
                      {item.created_at && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Submitted: {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Status Badge & Selector */}
                    <td
                      className="py-4 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item, e.target.value)}
                        disabled={isSubmitting}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-full border bg-slate-950/80 cursor-pointer focus:outline-none transition-colors ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        <option value="pending" className="bg-slate-900 text-amber-400">
                          Pending
                        </option>
                        <option value="approved" className="bg-slate-900 text-emerald-400">
                          Approved
                        </option>
                        <option value="rejected" className="bg-slate-900 text-red-400">
                          Rejected
                        </option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td
                      className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenDetailModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="View Details & Notes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Delete Request"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer & Pagination */}
        {pagination.total_pages > 1 && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <span className="text-slate-200 font-semibold">{pagination.current_page}</span> of{" "}
              <span className="text-slate-200 font-semibold">{pagination.total_pages}</span> ({pagination.total} total items)
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= pagination.total_pages}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.total_pages, prev + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details & Edit Notes Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={handleCloseDetailModal}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Meeting Request #{selectedRequest.id}</span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase tracking-wider ${getStatusBadge(
                        selectedRequest.status
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitted on{" "}
                    {selectedRequest.created_at
                      ? new Date(selectedRequest.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <button
                  onClick={handleCloseDetailModal}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Section 1: Requester Details */}
                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Requester Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Name</span>
                      <span className="font-semibold text-slate-100 text-sm">{selectedRequest.full_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Email Address</span>
                      <a href={`mailto:${selectedRequest.email}`} className="text-amber-400 hover:underline">
                        {selectedRequest.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Country</span>
                      <span className="text-slate-200 font-medium">{selectedRequest.country}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Phone Number</span>
                      <span className="text-slate-200 font-medium">{selectedRequest.phone || "Not provided"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-[10px]">Academic / Professional Affiliation</span>
                      <span className="text-slate-200 font-medium">{selectedRequest.affiliation || "Independent / N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Meeting Logistics */}
                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Meeting Details & Logistics
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Meeting Purpose</span>
                      <span className="font-semibold text-slate-100">{selectedRequest.meeting_purpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Preferred Date</span>
                      <span className="font-semibold text-slate-100">
                        {selectedRequest.preferred_date
                          ? new Date(selectedRequest.preferred_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Duration</span>
                      <span className="font-semibold text-amber-400">{selectedRequest.duration} Minutes</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Discussion Points */}
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Brief Description / Discussion Points
                  </h4>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.discussion_points || "No specific discussion points provided."}
                  </div>
                </div>

                {/* Section 4: Admin Status & Notes Management */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Admin Action & Notes
                  </h4>

                  {/* Status Toggle Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "approved", "rejected"] as const).map((st) => {
                      const isSelected = editStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setEditStatus(st);
                            handleUpdateStatusAndNotes(st, editAdminNotes);
                          }}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer capitalize ${
                            isSelected
                              ? st === "approved"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                                : st === "rejected"
                                ? "bg-red-500/20 text-red-300 border-red-500"
                                : "bg-amber-500/20 text-amber-300 border-amber-500"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          Mark as {st}
                        </button>
                      );
                    })}
                  </div>

                  {/* Admin Notes Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Internal Admin Notes / Comments
                    </label>
                    <textarea
                      rows={3}
                      value={editAdminNotes}
                      onChange={(e) => setEditAdminNotes(e.target.value)}
                      placeholder="Add internal notes regarding schedule, Google Meet / Zoom link, confirmation details..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => setDeletingItem(selectedRequest)}
                  className="px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
                >
                  Delete Request
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseDetailModal}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatusAndNotes(editStatus, editAdminNotes)}
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => !isSubmitting && setDeletingItem(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">Delete Meeting Request</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete meeting request from{" "}
                  <strong className="text-slate-200">{deletingItem.full_name}</strong> ({deletingItem.email})? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
