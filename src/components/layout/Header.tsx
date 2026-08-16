"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "../ui/container";
import { Logo } from "./Logo";
import { Navbar, DEFAULT_NAV_ITEMS, NavigationItem } from "./Navbar";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { BookMeetingModal } from "../common/BookMeetingModal";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { ProfileService } from "@/src/services/profile.service";
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
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const pathname = usePathname();
  const [siteTitle, setSiteTitle] = useState<string | undefined>();
  const [siteSubtitle, setSiteSubtitle] = useState<string | undefined>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;
    SiteSettingService.getSiteSettings()
      .then((settings) => {
        if (isMounted && settings) {
          if (settings.site_name) setSiteTitle(settings.site_name);
          if (settings.site_tagline) setSiteSubtitle(settings.site_tagline);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Header failed to load site settings:", err);
        }
      });

    ProfileService.getProfile()
      .then((profile) => {
        if (isMounted && profile?.profile_photo_url) {
          setProfilePhotoUrl(profile.profile_photo_url);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Header failed to load profile data:", err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentActiveHref = activeHref || pathname || "/";

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xs ${className}`}
    >
      <Container size="lg" padding="normal">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Dynamic Logo with Site Settings Title & Tagline */}
          <Logo title={siteTitle} subtitle={siteSubtitle} imageUrl={profilePhotoUrl} />

          {/* Desktop Navigation */}
          <Navbar items={navItems} activeHref={currentActiveHref} />

          {/* Desktop Actions & Mobile Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMeetingModalOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 cursor-pointer active:scale-95 shrink-0"
            >
              Book a Meeting
            </button>

            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-colors cursor-pointer"
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
        onOpenBookMeeting={() => setIsMeetingModalOpen(true)}
      />

      {/* Book Meeting Modal */}
      <BookMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
      />
    </header>
  );
};
