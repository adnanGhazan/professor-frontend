"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "../ui/container";
import { Logo } from "./Logo";
import { Navbar, DEFAULT_NAV_ITEMS, NavigationItem } from "./Navbar";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

export interface HeaderProps {
  navItems?: NavigationItem[];
  activeHref?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  navItems = DEFAULT_NAV_ITEMS,
  activeHref,
  className = "",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const currentActiveHref = activeHref || pathname || "/";

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xs ${className}`}
    >
      <Container size="lg" padding="normal">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <Navbar items={navItems} activeHref={currentActiveHref} />

          {/* Desktop Actions & Mobile Trigger */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-colors"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
        activeHref={currentActiveHref}
      />
    </header>
  );
};
