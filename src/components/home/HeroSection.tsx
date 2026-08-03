import React from "react";
import Link from "next/link";
import { Container } from "../ui/container";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export interface HeroSectionProps {
  name?: string;
  title?: string;
  institution?: string;
  introduction?: string;
  badges?: string[];
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  name = "Dr. Alex Morgan, Ph.D.",
  title = "Professor & Chair of Artificial Intelligence",
  institution = "Department of Computer Science & Engineering",
  introduction = "Pioneering research at the intersection of deep learning, ethical AI systems, and automated reasoning. Dedicated to advancing scientific inquiry, mentoring graduate researchers, and building impactful computational models for complex global challenges.",
  badges = ["IEEE Fellow", "ACM Distinguished Scientist", "Director, AI Research Lab"],
  className = "",
}) => {
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
              {institution}
            </Badge>

            {/* Professor Name */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans leading-[1.1]">
              {name}
            </h1>

            {/* Academic Title */}
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 dark:text-blue-400 leading-snug">
              {title}
            </h2>

            {/* Short Professional Introduction */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {introduction}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link href="#research" passHref>
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

              <Link href="#contact" passHref>
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
                  150+
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Publications
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  12.5k+
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Citations
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  18
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

              {/* Portrait Graphic / Avatar Placeholder */}
              <div className="relative aspect-4/3 w-full rounded-2xl bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner">
                {/* Academic Crest / Cap Graphic */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
                  <svg
                    className="w-16 h-16 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  Academic Portrait
                </span>
                <span className="text-xs text-slate-300 font-medium mt-1">
                  Research Laboratory & Faculty
                </span>
              </div>

              {/* Academic Badges List */}
              <div className="mt-6 flex flex-wrap gap-2">
                {badges.map((badgeText) => (
                  <Badge
                    key={badgeText}
                    variant="accent"
                    size="sm"
                    className="font-medium shadow-2xs"
                  >
                    {badgeText}
                  </Badge>
                ))}
              </div>

              {/* Quick Info Bar */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold">Office Hours:</span>
                </div>
                <span className="font-mono">Tue & Thu 2:00 - 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
