"use client";

import React, { useEffect, useState } from "react";
import { AuthService } from "@/src/services/auth.service";

export interface AdminTopNavbarProps {
  onToggleMobileSidebar: () => void;
}

export const AdminTopNavbar: React.FC<AdminTopNavbarProps> = ({ onToggleMobileSidebar }) => {
  const [adminName, setAdminName] = useState("Dr. Alex Morgan");
  const [adminEmail, setAdminEmail] = useState("alex.morgan@university.edu");

  useEffect(() => {
    const user = AuthService.getUser();
    if (user) {
      if (user.name) setAdminName(user.name);
      if (user.email) setAdminEmail(user.email);
    }
  }, []);

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
        {/* Notifications Icon Button */}
        <button
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {/* Notification Ping Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400">
            <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
          </span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-800" />

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 p-[1px] shadow-sm">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-slate-100 text-xs font-bold font-mono">
              {adminName.charAt(0)}
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 tracking-tight leading-none">{adminName}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{adminEmail}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
