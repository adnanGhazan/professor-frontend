"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DocumentService } from "@/src/services/document.service";
import { SocialLinkService } from "@/src/services/social-link.service";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { ProfileService } from "@/src/services/profile.service";
import { PublicationService } from "@/src/services/publication.service";
import { StudentService } from "@/src/services/student.service";
import { SocialLink } from "@/src/types/social-link";
import { SocialIcon } from "../ui/social-icon";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";

export interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [heroName, setHeroName] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState<string | null>(null);
  const [heroIntro, setHeroIntro] = useState<string | null>(null);
  const [heroUniversity, setHeroUniversity] = useState<string | null>(null);
  const [heroDepartment, setHeroDepartment] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [totalPublications, setTotalPublications] = useState(0);
  const [totalCitations, setTotalCitations] = useState(0);
  const [totalPhD, setTotalPhD] = useState(0);

  // Fetch All Data
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      SiteSettingService.getSiteSettings(),
      ProfileService.getProfile(),
      DocumentService.getPublicDocuments(),
      SocialLinkService.getPublicSocialLinks(),
      PublicationService.getPublicPublications(),
      StudentService.getPublicStudents()
    ]).then(([settingsResult, profileResult, docsResult, linksResult, pubResult, studentResult]) => {
      if (!isMounted) return;

      // Site Settings & Profile Logic
      let fallbackName = null;
      let fallbackTitle = null;
      let fallbackIntro = null;

      if (settingsResult.status === 'fulfilled' && settingsResult.value) {
        fallbackName = settingsResult.value.site_name || null;
        fallbackTitle = settingsResult.value.site_tagline || null;
        fallbackIntro = settingsResult.value.site_description || null;
      }

      if (profileResult.status === 'fulfilled' && profileResult.value) {
        const p = profileResult.value;
        setHeroName(p.name || fallbackName);
        setHeroTitle(p.designation || p.title || fallbackTitle);
        setHeroIntro(p.short_bio || p.biography || p.research_summary || fallbackIntro);
        setHeroUniversity(p.university || null);
        setHeroDepartment(p.department || null);
        setProfilePhotoUrl(p.profile_photo_url || null);
      } else {
        setHeroName(fallbackName);
        setHeroTitle(fallbackTitle);
        setHeroIntro(fallbackIntro);
      }

      // Stats Logic
      if (pubResult.status === 'fulfilled' && pubResult.value) {
        const pubs = pubResult.value;
        setTotalPublications(pubs.length);
        setTotalCitations(pubs.reduce((sum, pub) => sum + (Number(pub.citation_count) || 0), 0));
      }

      if (studentResult.status === 'fulfilled' && studentResult.value) {
        let studentList: any[] = [];
        if (Array.isArray(studentResult.value)) {
          studentList = studentResult.value;
        } else if (typeof studentResult.value === "object" && Array.isArray((studentResult.value as any).items)) {
          studentList = (studentResult.value as any).items;
        } else if (typeof studentResult.value === "object" && Array.isArray((studentResult.value as any).data)) {
          studentList = (studentResult.value as any).data;
        }

        const normalize = (value?: string | null) =>
          (value ?? "")
            .toLowerCase()
            .replace(/\./g, "")
            .trim();

        const phdCount = studentList.filter((s: any) => {
          const degree = normalize(s.degree ?? s.program ?? s.level ?? s.degree_name);
          const status = normalize(s.status ?? s.student_status ?? s.academic_status);

          const isPhd =
            degree.includes("phd") ||
            degree.includes("doctoral") ||
            degree.includes("doctor of philosophy") ||
            degree.includes("doctorate");

          const isGraduate =
            status.includes("graduated") ||
            status.includes("completed") ||
            status.includes("alumni") ||
            status.includes("alumnus") ||
            status.includes("passed") ||
            status.includes("former") ||
            (status !== "current" && status !== "active" && status !== "ongoing" && (s.completion_year != null || status !== ""));

          return isPhd && isGraduate;
        }).length;

        setTotalPhD(phdCount);
      }

      // CV Document Logic
      if (docsResult.status === 'fulfilled') {
        const cvDoc = docsResult.value.find((d) => {
          const typeMatch = d.document_type ? d.document_type.toLowerCase().includes("cv") || d.document_type.toLowerCase().includes("curriculum") : false;
          const titleMatch = d.title ? d.title.toLowerCase().includes("cv") || d.title.toLowerCase().includes("curriculum") : false;
          return (typeMatch || titleMatch) && Boolean(d.file_url);
        });
        if (cvDoc?.file_url) setCvUrl(cvDoc.file_url);
      }

      // Social Links Logic
      if (linksResult.status === 'fulfilled') {
        setSocialLinks(linksResult.value);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className={`relative w-full h-[500px] flex items-center justify-center bg-slate-50 dark:bg-slate-950 ${className}`}>
        <Spinner size="lg" className="text-blue-600" />
      </section>
    );
  }

  return (
    <section
      className={`relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950 py-16 sm:py-20 lg:py-28 transition-colors duration-200 ${className}`}
    >
      {/* Background Decorative Ambient Shapes & Gradients */}
      <div
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/10 dark:bg-blue-500/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-0 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="lg" padding="normal" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Academic Title, Bio, & Calls to Action */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            {/* Institution Badge */}
            {(heroUniversity || heroDepartment) && (
              <Badge
                variant="primary"
                size="md"
                className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider shadow-xs"
                icon={
                  <svg
                    className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                }
              >
                {[heroUniversity, heroDepartment].filter(Boolean).join(" • ")}
              </Badge>
            )}

            {/* Professor Name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans leading-[1.1]">
              {heroName}
            </h1>

            {/* Academic Title / Tagline */}
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 dark:text-blue-400 leading-snug">
              {heroTitle}
            </h2>

            {/* Short Professional Introduction */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {heroIntro}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link href="/research" passHref>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  }
                >
                  View Research
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
                    size="lg"
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

              <Link href="/contact" passHref>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                >
                  Contact
                </Button>
              </Link>
            </div>

            {/* Academic Impact Metrics Bar */}
            <div className="pt-8 grid grid-cols-3 gap-6 sm:gap-8 border-t border-slate-200/80 dark:border-slate-800/80 w-full max-w-lg mt-4">
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {totalPublications}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Publications
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {totalCitations}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Citations
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {totalPhD}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Ph.D. Graduates
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Academic Portrait Card & Badges */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-slate-950/50">
              {/* Decorative Accent Corner Pill */}
              <div className="absolute -top-3 -right-3">
                <span className="flex h-6 w-6 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500"></span>
                </span>
              </div>

              {/* Portrait Graphic / Avatar */}
              <div className="flex w-full justify-center mb-6">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner border-4 border-slate-100 dark:border-slate-800 shadow-2xl">
                  {profilePhotoUrl && !imageError ? (
                    <img 
                      src={profilePhotoUrl} 
                      alt={heroName || "Profile"} 
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <>
                      {/* Academic Crest / Cap Graphic */}
                      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20 z-10">
                        <svg
                          className="w-12 h-12 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold tracking-tight text-white text-center z-10 line-clamp-1">
                        {heroName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold">Office Hours:</span>
                </div>
                <span className="font-mono">9:00 AM – 4:00 PM</span>
              </div>

              {/* Dynamic Social & Academic Profiles Row */}
              {socialLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 justify-center">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label || link.platform}
                      title={link.label || link.platform}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                    >
                      <SocialIcon platform={link.platform} className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
