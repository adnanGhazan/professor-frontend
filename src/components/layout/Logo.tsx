import React from "react";
import Link from "next/link";
import { SITE_METADATA } from "../../constants/site";

export interface LogoProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  title = SITE_METADATA.name || "Academic Portfolio",
  subtitle = "Department of Computer Science",
  className = "",
}) => {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-lg p-1 transition-transform active:scale-[0.98] ${className}`}
      aria-label={`${title} - Home`}
    >
      {/* Academic Cap Emblem */}
      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-900 text-white dark:bg-blue-600 shadow-sm group-hover:bg-blue-800 dark:group-hover:bg-blue-500 transition-colors duration-200 shrink-0">
        <svg
          className="h-5 w-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors duration-200">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
};
