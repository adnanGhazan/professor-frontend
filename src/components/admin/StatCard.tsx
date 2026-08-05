"use client";

import React from "react";
import { motion } from "framer-motion";

export interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  trend?: string;
  icon: React.ReactNode;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  label,
  trend,
  icon,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-950/40 hover:border-slate-700/80 transition-all group overflow-hidden"
    >
      {/* Light Reflection Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1 tracking-tight">
            {value}
          </div>
        </div>

        {/* Icon Emblem Container */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>

      {/* Sublabel & Trend Badge */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        {trend && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono text-[10px] font-semibold border border-amber-500/20">
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};
