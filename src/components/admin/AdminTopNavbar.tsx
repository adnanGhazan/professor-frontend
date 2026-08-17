"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { AuthService } from "@/src/services/auth.service";
import { MeetingRequestService } from "@/src/services/meeting-request.service";
import { fetcher } from "@/src/lib/api";
import { env } from "@/src/lib/env";
import { ChangePasswordModal } from "./ChangePasswordModal";

export interface AdminTopNavbarProps {
  onToggleMobileSidebar: () => void;
}

export interface NotificationItem {
  id: string;
  type: "meeting" | "contact";
  title: string;
  senderName: string;
  date: string;
  status: string;
  link: string;
  rawDate?: string;
}

export const AdminTopNavbar: React.FC<AdminTopNavbarProps> = ({ onToggleMobileSidebar }) => {
  const [adminName, setAdminName] = useState("Dr. Alex Morgan");
  const [adminEmail, setAdminEmail] = useState("alex.morgan@university.edu");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = AuthService.getUser();
    if (user) {
      if (user.name) setAdminName(user.name);
      if (user.email) setAdminEmail(user.email);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = AuthService.getToken();
    if (!token) return;

    setIsLoadingNotifications(true);
    const itemsList: NotificationItem[] = [];

    // 1. Fetch Meeting Requests
    try {
      const meetingRes = await MeetingRequestService.getAdminMeetingRequests();
      const rawMeetings = meetingRes?.items || [];
      const pendingMeetings = rawMeetings.filter(
        (m: any) => !m.status || m.status.toLowerCase() === "pending"
      );

      pendingMeetings.forEach((m: any) => {
        itemsList.push({
          id: `meeting-${m.id}`,
          type: "meeting",
          title: m.topic || m.subject || "Meeting Request",
          senderName: m.name || m.email || "Requester",
          date: m.created_at || m.preferred_date || "",
          status: "Pending",
          link: "/admin/meeting-requests",
          rawDate: m.created_at || m.preferred_date || "",
        });
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch meeting requests for notifications:", err);
      }
    }

    // 2. Fetch Contact Messages
    try {
      const baseUrl = env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
      const contactRes = await fetcher<any>(`${baseUrl}/contact-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let contactItems: any[] = [];
      if (contactRes?.data?.data?.data && Array.isArray(contactRes.data.data.data)) {
        contactItems = contactRes.data.data.data;
      } else if (contactRes?.data?.data && Array.isArray(contactRes.data.data)) {
        contactItems = contactRes.data.data;
      } else if (contactRes?.data?.items && Array.isArray(contactRes.data.items)) {
        contactItems = contactRes.data.items;
      } else if (contactRes?.data && Array.isArray(contactRes.data)) {
        contactItems = contactRes.data;
      } else if (contactRes?.items && Array.isArray(contactRes.items)) {
        contactItems = contactRes.items;
      } else if (Array.isArray(contactRes)) {
        contactItems = contactRes;
      }

      const unreadMessages = contactItems.filter(
        (c: any) => c.is_read === false || c.is_read === 0 || c.is_read === "0"
      );

      unreadMessages.forEach((c: any) => {
        itemsList.push({
          id: `contact-${c.id}`,
          type: "contact",
          title: c.subject || "Contact Message",
          senderName: c.name || c.email || "Sender",
          date: c.created_at || "",
          status: "Unread",
          link: "/admin/contact-messages",
          rawDate: c.created_at || "",
        });
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch contact messages for notifications:", err);
      }
    }

    // Sort notifications by date descending
    itemsList.sort((a, b) => {
      const dateA = new Date(a.rawDate || 0).getTime();
      const dateB = new Date(b.rawDate || 0).getTime();
      return dateB - dateA;
    });

    setNotifications(itemsList);
    setIsLoadingNotifications(false);
  }, []);

  useEffect(() => {
    fetchNotifications();

    // 60 seconds interval polling
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    if (isNotificationsOpen || isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationsOpen, isProfileMenuOpen]);

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Hamburger & Search Bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search records, publications, projects..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Icon Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) fetchNotifications();
            }}
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse font-mono">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {unreadCount} pending
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fetchNotifications()}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono cursor-pointer"
                  title="Refresh notifications"
                >
                  ↻ Refresh
                </button>
              </div>

              {/* Notification List Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                {isLoadingNotifications ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-mono animate-pulse">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-300">No New Notifications</p>
                    <p className="text-xs text-slate-500">All meeting requests and messages have been reviewed.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-3.5 hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl text-xs shrink-0 ${
                          item.type === "meeting"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {item.type === "meeting" ? "📅" : "✉️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                              {item.senderName}
                            </span>
                            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 uppercase">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {item.title}
                          </p>
                          {item.date && (
                            <p className="text-[10px] font-mono text-slate-500 mt-1">
                              {formatDateLabel(item.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Dropdown Footer Links */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                <Link
                  href="/admin/meeting-requests"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-amber-400 hover:underline"
                >
                  Meeting Requests →
                </Link>
                <Link
                  href="/admin/contact-messages"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-blue-400 hover:underline"
                >
                  Messages →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-800" />

        {/* Admin Profile Pill & Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group text-left focus:outline-none"
            aria-label="Admin Profile Menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 p-[1px] shadow-sm shrink-0">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-slate-100 text-xs font-bold font-mono">
                {adminName.charAt(0)}
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                {adminName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{adminEmail}</div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isProfileMenuOpen ? "rotate-180 text-amber-400" : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
                <p className="text-xs font-bold text-slate-100 truncate">{adminName}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{adminEmail}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-amber-400 hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-amber-400"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};
