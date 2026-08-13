import React from "react";
import Link from "next/link";
import { SITE_METADATA } from "../../constants/site";

export interface LogoProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  title = SITE_METADATA.name || "Academic Portfolio",
  subtitle = "Department of Computer Science",
  imageUrl,
  className = "",
}) => {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-lg p-1 transition-transform active:scale-[0.98] ${className}`}
      aria-label={`${title} - Home`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-[44px] w-[44px] shrink-0 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
            }
          }}
        />
      ) : null}

      <div 
        className={`flex items-center justify-center h-[44px] w-[44px] shrink-0 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm ${imageUrl ? 'hidden' : 'flex'}`}
      >
        <svg
          className="h-5 w-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    </Link>
  );
};
