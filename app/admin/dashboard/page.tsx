"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/src/components/admin/StatCard";

export default function DashboardPage() {
  const stats = [
    {
      title: "Publications",
      value: "45+",
      label: "Peer-reviewed Papers",
      trend: "+3 this year",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
      delay: 0.1,
    },
    {
      title: "Students",
      value: "18",
      label: "Active Scholars",
      trend: "12 Ph.D. / 6 M.S.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      delay: 0.2,
    },
    {
      title: "Projects",
      value: "12",
      label: "Funded Grants",
      trend: "$4.2M Budget",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" />
        </svg>
      ),
      delay: 0.3,
    },
    {
      title: "Awards",
      value: "8",
      label: "Academic Honors",
      trend: "2 International",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
      delay: 0.4,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Title Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overview of academic performance, active research, and portfolio statistics.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Status: Online</span>
        </div>
      </motion.div>

      {/* 4 Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Area Placeholder Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-950/60 overflow-hidden text-center space-y-6"
      >
        {/* Decorative Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        {/* Center Emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-slate-900 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        {/* Headline & Placeholder Message */}
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome to Professor Portfolio CMS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Your centralized administrative portal for managing faculty biography, educational background, professional experience, research publications, active projects, student supervisions, and media assets.
          </p>
        </div>

        {/* System Details Pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 font-mono">
            Version: <strong className="text-amber-400 font-normal">v1.0.0 (Phase 6C)</strong>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 font-mono">
            API Environment: <strong className="text-emerald-400 font-normal">Sanctum Auth Connected</strong>
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 font-mono">
            UI Framework: <strong className="text-indigo-400 font-normal">Next.js App Router</strong>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
