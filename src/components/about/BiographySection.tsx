import React from "react";
import Link from "next/link";
import { Container } from "../ui/container";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

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
  name = "Dr. Alex Morgan, Ph.D.",
  title = "Professor & Chair of Computer Science",
  department = "Department of Computer Science & Artificial Intelligence",
  university = "University Faculty of Science & Engineering",
  bioParagraphs = [
    "Dr. Alex Morgan is a Full Professor and Chair of Artificial Intelligence at the Department of Computer Science. With over 15 years of academic and research leadership, Dr. Morgan leads pioneering investigations in scalable deep learning representations, automated neural verification, and ethical AI governance.",
    "Dr. Morgan earned his Ph.D. in Computer Science with a focus on neural network optimization and formal safety methods. Prior to his current appointment, he served as Associate Professor and Director of the Autonomous Systems Laboratory, leading multi-million-dollar research initiatives sponsored by the National Science Foundation (NSF) and industry research grants.",
    "Passionate about graduate mentorship and computer science pedagogy, Dr. Morgan has supervised over 40 Ph.D. and Master's thesis researchers. He frequently serves as Program Chair and Senior Area Chair for top-tier international conferences including NeurIPS, ICML, CVPR, and PLDI.",
  ],
  quote = "Our research mission is to advance computational intelligence while building mathematical guarantees for safety, fairness, and human alignment.",
  className = "",
}) => {
  return (
    <section className={`relative w-full py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden ${className}`}>
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-400/10 blur-3xl pointer-events-none" />

      <Container size="lg" padding="normal" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side Portrait Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-slate-950/50">
              <div className="relative aspect-4/3 w-full rounded-2xl bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
                  <svg className="w-16 h-16 text-amber-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">{name}</span>
                <span className="text-xs text-slate-300 font-medium mt-1">Academic Faculty Portrait</span>
              </div>

              <div className="mt-6 space-y-3">
                <Badge variant="primary" size="md" className="w-full justify-center">
                  Full Professor & Chair
                </Badge>
                <div className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium">
                  {department}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Bio Text */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <Badge variant="outline" size="sm" className="mb-3 uppercase tracking-wider font-semibold">
                About the Professor
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-tight">
                {name}
              </h1>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-400 mt-2">
                {title}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {university}
              </p>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base font-normal">
              {bioParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {quote && (
              <blockquote className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-900 dark:border-blue-500 text-xs sm:text-sm italic font-medium text-slate-800 dark:text-slate-200">
                &ldquo;{quote}&rdquo;
              </blockquote>
            )}

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="#contact-info" passHref>
                <Button variant="primary" size="md">
                  Contact Office
                </Button>
              </Link>
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
