"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import { AdminTopNavbar } from "@/src/components/admin/AdminTopNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAuthOrIndexPage = pathname === "/admin/login" || pathname === "/admin";

  if (isAuthOrIndexPage) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Left Sidebar */}
      <AdminSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Body */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all">
        {/* Top Navbar */}
        <AdminTopNavbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Page View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
