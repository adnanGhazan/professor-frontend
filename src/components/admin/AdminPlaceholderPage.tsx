"use client";

import React from "react";
import { motion } from "framer-motion";

export interface AdminPlaceholderPageProps {
  title: string;
  description: string;
}

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {description}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h10" />
            <path d="M7 12h10" />
            <path d="M7 17h6" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-200">{title} Management</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          This management panel is configured and ready for CRUD operation views.
        </p>
      </motion.div>
    </div>
  );
};
