"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/src/services/auth.service";
import { fetcher } from "@/src/lib/api";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export interface ContactMessage {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminContactMessagesPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [viewingItem, setViewingItem] = useState<ContactMessage | null>(null);
  const [deletingItem, setDeletingItem] = useState<ContactMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = AuthService.getToken();
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      const response = await fetcher<any>(`${process.env.NEXT_PUBLIC_API_URL}/contact-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      

      let items: any[] = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        items = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response?.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        items = response.items;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      setMessages(items);
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401 || err.message === "Unauthenticated." || err.message?.includes("status 401") || err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        router.push("/admin/login");
        return;
      }
      setErrorMsg(err.message || "Failed to fetch contact messages.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (viewingItem || deletingItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [viewingItem, deletingItem]);

  const handleOpenViewModal = async (msg: ContactMessage) => {
    setViewingItem(msg);
    setErrorMsg(null);
    // Optionally fetch full details if needed, but the list usually has everything.
    try {
      const token = AuthService.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const data = await fetcher<any>(`${baseUrl}/contact-messages/${msg.id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      const detailedMsg = data?.data || data;
      setViewingItem(detailedMsg);
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401 || err.message === "Unauthenticated." || err.message?.includes("status 401") || err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        router.push("/admin/login");
        return;
      }
      // If single fetch fails, we still have the list data
    }
  };

  const handleCloseViewModal = () => {
    setViewingItem(null);
  };

  const handleMarkAsRead = async (id: string | number) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const token = AuthService.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      await fetcher(`${baseUrl}/contact-messages/${id}/read`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      setSuccessMsg("Message marked as read.");
      fetchMessages();
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401 || err.message === "Unauthenticated." || err.message?.includes("status 401") || err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        router.push("/admin/login");
        return;
      }
      setErrorMsg(err.message || "Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const token = AuthService.getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      await fetcher(`${baseUrl}/contact-messages/${deletingItem.id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      setSuccessMsg("Message deleted successfully.");
      setDeletingItem(null);
      fetchMessages();
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401 || err.message === "Unauthenticated." || err.message?.includes("status 401") || err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        router.push("/admin/login");
        return;
      }
      setErrorMsg(err.message || "Failed to delete message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Contact Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View and manage inquiries submitted through the public contact form.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-between gap-3"
          >
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-between gap-3"
          >
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-sm font-medium text-slate-400 animate-pulse font-mono">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState title="No Contact Messages" description="There are no contact messages at this time." />
      ) : (
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6 text-center">Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-100">{msg.name}</td>
                    <td className="py-4 px-6 text-slate-400">{msg.email}</td>
                    <td className="py-4 px-6 text-slate-300">{msg.subject}</td>
                    <td className="py-4 px-6 text-center text-slate-400 font-mono whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${msg.is_read ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-blue-500/10 text-blue-400 border-blue-500/30"}`}>
                        {msg.is_read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      <button onClick={() => handleOpenViewModal(msg)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition-colors">View</button>
                      {!msg.is_read && (
                        <button onClick={() => handleMarkAsRead(msg.id)} disabled={isSubmitting} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold transition-colors">Mark Read</button>
                      )}
                      <button onClick={() => setDeletingItem(msg)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseViewModal} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 z-10 flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-100">Message Details</h3>
                <button onClick={handleCloseViewModal} className="text-slate-400 hover:text-slate-200">✕</button>
              </div>
              <div className="space-y-4">
                <div><span className="text-xs font-semibold text-slate-500 uppercase">Name</span><p className="text-slate-200 font-medium">{viewingItem.name}</p></div>
                <div><span className="text-xs font-semibold text-slate-500 uppercase">Email</span><p className="text-slate-200"><a href={`mailto:${viewingItem.email}`} className="text-amber-400 hover:underline">{viewingItem.email}</a></p></div>
                <div><span className="text-xs font-semibold text-slate-500 uppercase">Subject</span><p className="text-slate-200">{viewingItem.subject}</p></div>
                <div><span className="text-xs font-semibold text-slate-500 uppercase">Date</span><p className="text-slate-400 font-mono text-sm">{new Date(viewingItem.created_at).toLocaleString()}</p></div>
                <div className="pt-4 border-t border-slate-800/60"><span className="text-xs font-semibold text-slate-500 uppercase">Message</span><div className="mt-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap">{viewingItem.message}</div></div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                {!viewingItem.is_read && (
                  <button onClick={() => { handleMarkAsRead(viewingItem.id); handleCloseViewModal(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">Mark as Read</button>
                )}
                <button onClick={handleCloseViewModal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeletingItem(null)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Message?</h3>
              <p className="text-sm text-slate-400 mb-6">Are you sure you want to delete this message from {deletingItem.name}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingItem(null)} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors">Cancel</button>
                <button onClick={handleConfirmDelete} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">{isSubmitting ? "Deleting..." : "Yes, Delete"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
