"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DocumentService } from "@/src/services/document.service";
import { ProfileService } from "@/src/services/profile.service";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { Container } from "../ui/container";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const RESEARCH_MISSION =
  "Our research mission is to advance computational intelligence while building mathematical guarantees for safety, fairness, and human alignment.";

export interface BiographySectionProps {
  name?: string;
  title?: string;
  department?: string;
  university?: string;
  bioParagraphs?: string[];
  quote?: string;
  className?: string;
}

export const BiographySection: React.FC<BiographySectionProps> = ({
  name: propName,
  title: propTitle,
  department: propDepartment,
  university: propUniversity,
  bioParagraphs: propBioParagraphs,
  quote = RESEARCH_MISSION,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(!propName && !propBioParagraphs);
  const [profileName, setProfileName] = useState<string | null>(propName || null);
  const [profileTitle, setProfileTitle] = useState<string | null>(propTitle || null);
  const [department, setDepartment] = useState<string | null>(propDepartment || null);
  const [university, setUniversity] = useState<string | null>(propUniversity || null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [bioParagraphs, setBioParagraphs] = useState<string[]>(propBioParagraphs || []);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      ProfileService.getProfile(),
      SiteSettingService.getSiteSettings(),
      DocumentService.getPublicDocuments(),
    ])
      .then(([profileResult, settingsResult, docsResult]) => {
        if (!isMounted) return;

        let fallbackName: string | null = null;
        let fallbackTitle: string | null = null;

        if (settingsResult.status === "fulfilled" && settingsResult.value) {
          fallbackName = settingsResult.value.site_name || null;
          fallbackTitle = settingsResult.value.site_tagline || null;
        }

        if (profileResult.status === "fulfilled" && profileResult.value) {
          const p = profileResult.value;
          if (!propName) setProfileName(p.name || fallbackName);
          if (!propTitle) setProfileTitle(p.designation || p.title || fallbackTitle);
          if (!propDepartment) setDepartment(p.department || null);
          if (!propUniversity) setUniversity(p.university || null);

          const photo = p.profile_photo_url || p.profile_photo || null;
          setProfilePhotoUrl(photo);

          if (!propBioParagraphs) {
            const rawBio =
              p.biography ||
              (p as any).full_bio ||
              (p as any).bio ||
              (p as any).about ||
              p.short_bio ||
              p.research_summary ||
              "";

            const parsed = rawBio
              ? rawBio
                  .split(/\r?\n\r?\n|\r?\n/)
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : [];
            setBioParagraphs(parsed);
          }

          if (p.cv_file_url || p.cv_file) {
            setCvUrl(p.cv_file_url || p.cv_file || null);
          }
        } else {
          if (!propName) setProfileName(fallbackName);
          if (!propTitle) setProfileTitle(fallbackTitle);
        }

        if (docsResult.status === "fulfilled" && docsResult.value) {
          const cvDoc = docsResult.value.find((d) => {
            const typeMatch = d.document_type
              ? d.document_type.toLowerCase().includes("cv") || d.document_type.toLowerCase().includes("curriculum")
              : false;
            const titleMatch = d.title
              ? d.title.toLowerCase().includes("cv") || d.title.toLowerCase().includes("curriculum")
              : false;
            return (typeMatch || titleMatch) && Boolean(d.file_url);
          });

          if (cvDoc?.file_url) {
            setCvUrl((prev) => prev || cvDoc.file_url);
          }
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("BiographySection failed to load profile data:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propName, propTitle, propDepartment, propUniversity, propBioParagraphs]);

  if (isLoading) {
    return (
      <section
        className={`relative w-full py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[400px] ${className}`}
      >
        <Spinner size="lg" className="text-blue-600" />
      </section>
    );
  }

  const displayName = profileName || "";

  return (
    <section
      className={`relative w-full py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden ${className}`}
    >
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none" />

      <Container size="lg" padding="normal" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side Portrait Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-slate-950/50">
              <div className="relative aspect-4/3 w-full rounded-2xl bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner">
                {profilePhotoUrl && !imageError ? (
                  <img
                    src={profilePhotoUrl}
                    alt={displayName || "Profile"}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20 z-10">
                      <svg
                        className="w-16 h-16 text-amber-400 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
                      </svg>
                    </div>
                    {displayName && (
                      <span className="text-lg font-bold text-white text-center z-10 line-clamp-1">
                        {displayName}
                      </span>
                    )}
                    <span className="text-xs text-slate-300 font-medium mt-1 z-10">
                      Academic Faculty Portrait
                    </span>
                  </>
                )}
              </div>

              {(profileTitle || department) && (
                <div className="mt-6 space-y-3">
                  {profileTitle && (
                    <Badge
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                    >
                      {profileTitle}
                    </Badge>
                  )}
                  {department && (
                    <div className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium">
                      {department}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Bio Text */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <Badge
                variant="outline"
                size="sm"
                className="mb-3 uppercase tracking-wider font-semibold"
              >
                About the Professor
              </Badge>
              {displayName && (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-tight">
                  {displayName}
                </h1>
              )}
              {profileTitle && (
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-400 mt-2">
                  {profileTitle}
                </p>
              )}
              {university && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {university}
                </p>
              )}
            </div>

            {bioParagraphs.length > 0 && (
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
                {bioParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {quote && (
              <blockquote className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-900 dark:border-blue-500 text-xs sm:text-sm italic font-medium text-slate-800 dark:text-slate-200">
                &ldquo;{quote}&rdquo;
              </blockquote>
            )}

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/contact" passHref>
                <Button variant="primary" size="md">
                  Contact Office
                </Button>
              </Link>

              {/* Dynamic Featured Download CV Button */}
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button
                    variant="accent"
                    size="md"
                    className="font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                    leftIcon={
                      <svg
                        className="w-4 h-4 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                      </svg>
                    }
                  >
                    Download CV
                  </Button>
                </a>
              )}

              <Link href="#experience-timeline" passHref>
                <Button variant="outline" size="md">
                  View Career Timeline
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

