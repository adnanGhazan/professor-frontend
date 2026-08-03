"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../ui/container";
import { Logo } from "./Logo";
import { SITE_METADATA } from "../../constants/site";

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={`w-full border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300 dark:bg-slate-950 ${className}`}
    >
      <Container size="lg" padding="normal" className="py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Logo className="text-white" />
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Dedicated to pioneering academic research, scholarly publication, and inspiring the next generation of computer science innovators.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-amber-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#research" className="hover:text-amber-400 transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link href="#publications" className="hover:text-amber-400 transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="#teaching" className="hover:text-amber-400 transition-colors">
                  Teaching
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Academic Resources
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#students" className="hover:text-amber-400 transition-colors">
                  Students & Lab
                </Link>
              </li>
              <li>
                <Link href="#awards" className="hover:text-amber-400 transition-colors">
                  Awards & Grants
                </Link>
              </li>
              <li>
                <Link href="#news" className="hover:text-amber-400 transition-colors">
                  News & Announcements
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="hover:text-amber-400 transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} {SITE_METADATA.name || "Academic Portfolio"}. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-2 py-1 cursor-pointer"
          >
            <span>Back to top</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </Container>
    </footer>
  );
};
