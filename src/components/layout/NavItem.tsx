import React from "react";
import Link from "next/link";

export interface NavItemProps {
  label: string;
  href: string;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  label,
  href,
  isActive = false,
  isMobile = false,
  onClick,
  className = "",
}) => {
  const baseClasses = isMobile
    ? "flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all duration-200"
    : "relative px-1.5 xl:px-2 2xl:px-2.5 py-2 text-xs xl:text-sm font-medium transition-all duration-200 rounded-lg inline-flex items-center whitespace-nowrap shrink-0";

  const activeClasses = isActive
    ? isMobile
      ? "bg-blue-900/10 text-blue-900 dark:bg-blue-600/20 dark:text-blue-400 font-semibold"
      : "text-blue-900 dark:text-blue-400 font-semibold"
    : "text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 ${className}`}
      aria-current={isActive ? "page" : undefined}
    >
      <span>{label}</span>

      {!isMobile && isActive && (
        <span
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-900 dark:bg-blue-400"
          aria-hidden="true"
        />
      )}
    </Link>
  );
};
