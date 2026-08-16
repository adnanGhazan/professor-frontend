"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "../ui/container";
import { Logo } from "./Logo";
import { SITE_METADATA } from "../../constants/site";
import { SocialLinkService } from "@/src/services/social-link.service";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SocialLink } from "@/src/types/social-link";
import { SocialIcon } from "../ui/social-icon";

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerText, setFooterText] = useState<string | null>(null);
  const [copyrightText, setCopyrightText] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch Public Social Links
    SocialLinkService.getPublicSocialLinks()
      .then((links) => {
        if (isMounted) {
          setSocialLinks(links);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Footer failed to load public social links:",
            err
          );
        }
      });

    // Fetch Site Settings
    SiteSettingService.getSiteSettings()
      .then((settings) => {
        if (!isMounted || !settings) return;

        if (settings.footer_text) {
          setFooterText(settings.footer_text);
        }

        if (settings.copyright_text) {
          setCopyrightText(settings.copyright_text);
        }

        if (settings.site_name) {
          setSiteName(settings.site_name);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Footer failed to load site settings:",
            err
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      className={`w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 ${className}`}
    >
      <Container
        size="lg"
        padding="normal"
        className="py-12 sm:py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column & Social Icons */}
          <div className="md:col-span-2 space-y-4">
            <Logo
              title={siteName || undefined}
              className="text-slate-900 dark:text-white"
            />

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              {footerText ||
                "Dedicated to pioneering academic research, scholarly publication, and inspiring the next generation of computer science innovators."}
            </p>

            {/* Public Social & Academic Profile Icons Row */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || link.platform}
                    title={link.label || link.platform}
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-all hover:scale-105 cursor-pointer"
                  >
                    <SocialIcon
                      platform={link.platform}
                      className="w-4 h-4"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h4>

            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/projects"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Projects
                </Link>
              </li>

              <li>
                <Link
                  href="/publications"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Publications
                </Link>
              </li>

              <li>
                <Link
                  href="/teaching"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Teaching
                </Link>
              </li>

              <li>
                <Link
                  href="/documents"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Course Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Academic Resources
            </h4>

            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/students"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Students & Lab
                </Link>
              </li>

              <li>
                <Link
                  href="/awards"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Awards & Grants
                </Link>
              </li>

              <li>
                <Link
                  href="/news"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  News & Announcements
                </Link>
              </li>

              <li>
                <Link
                  href="/gallery"
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>
            {copyrightText
              ? copyrightText
              : `© ${currentYear} ${siteName ||
              SITE_METADATA.name ||
              "Academic Portfolio"
              }. All rights reserved.`}
          </p>

          <button
            onClick={scrollToTop}
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-2 py-1 cursor-pointer"
          >
            <span>Back to top</span>

            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </Container>
    </footer>
  );
};