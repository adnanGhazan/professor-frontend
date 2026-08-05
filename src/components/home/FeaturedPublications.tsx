import React from "react";
import Link from "next/link";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface PublicationItem {
  id: string;
  title: string;
  venue: string;
  year: string;
  authors: string;
  category: string;
  citations: string;
  doi: string;
  url?: string;
}

export interface FeaturedPublicationsProps {
  publications?: PublicationItem[];
  className?: string;
}

export const FeaturedPublications: React.FC<FeaturedPublicationsProps> = ({
  publications = [
    {
      id: "pub-1",
      title: "Scalable Self-Supervised Learning Frameworks for High-Dimensional Representation Recovery",
      venue: "IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)",
      year: "2024",
      authors: "A. Morgan, R. Chen, E. Vance, S. Gupta",
      category: "Deep Learning",
      citations: "342 Citations",
      doi: "10.1109/TPAMI.2024.3359102",
      url: "https://doi.org/10.1109/TPAMI.2024.3359102",
    },
    {
      id: "pub-2",
      title: "Formal Verification of Autonomous Deep Neural Network Controllers under Adversarial Constraints",
      venue: "ACM SIGPLAN Conference on Programming Language Design and Implementation (PLDI)",
      year: "2023",
      authors: "A. Morgan, K. Tanaka, J. Miller",
      category: "Artificial Intelligence",
      citations: "218 Citations",
      doi: "10.1145/3591234.3591280",
      url: "https://doi.org/10.1145/3591234.3591280",
    },
    {
      id: "pub-3",
      title: "Transformer-Based Multimodal Reasoning for Complex 3D Scene Reconstruction",
      venue: "IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: "2023",
      authors: "S. Patel, A. Morgan, L. Zhang, D. Ross",
      category: "Computer Vision",
      citations: "415 Citations",
      doi: "10.1109/CVPR.2023.01892",
      url: "https://doi.org/10.1109/CVPR.2023.01892",
    },
    {
      id: "pub-4",
      title: "Aligning Large Language Models with Ethical Principles using Constrained Policy Optimization",
      venue: "Advances in Neural Information Processing Systems (NeurIPS)",
      year: "2024",
      authors: "A. Morgan, M. Al-Mansoor, H. Hoffman",
      category: "Natural Language Processing",
      citations: "189 Citations",
      doi: "10.5555/NeurIPS2024.89421",
      url: "https://doi.org/10.5555/NeurIPS2024.89421",
    },
    {
      id: "pub-5",
      title: "Privacy-Preserving Federated Learning for Distributed Medical Diagnostic Networks",
      venue: "ACM Conference on Computer and Communications Security (CCS)",
      year: "2022",
      authors: "E. Vance, A. Morgan, G. Thorne",
      category: "Cyber Security",
      citations: "512 Citations",
      doi: "10.1145/3548659.3557410",
      url: "https://doi.org/10.1145/3548659.3557410",
    },
    {
      id: "pub-6",
      title: "Provably Efficient Reinforcement Learning in Non-Stationary Markov Decision Processes",
      venue: "International Conference on Machine Learning (ICML)",
      year: "2023",
      authors: "A. Morgan, B. Kovacs, R. Chen",
      category: "Machine Learning",
      citations: "275 Citations",
      doi: "10.5555/ICML2023.78201",
      url: "https://doi.org/10.5555/ICML2023.78201",
    },
  ],
  className = "",
}) => {
  return (
    <Section variant="surface" padding="lg" className={`relative overflow-hidden ${className}`}>
      {/* Ambient background decoration */}
      <div
        className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-12">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="Scholarly Output"
          title="Featured Publications"
          description="Selected high-impact research publications."
          align="center"
        />

        {/* Responsive Grid of Publication Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publications.map((pub) => (
            <Card
              key={pub.id}
              variant="default"
              hover
              className="group relative flex flex-col justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
            >
              <div>
                {/* Top Badges: Category & Year */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge variant="primary" size="sm" className="font-semibold">
                    {pub.category}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {pub.year}
                  </span>
                </div>

                {/* Title */}
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors font-sans leading-snug line-clamp-2">
                    {pub.title}
                  </CardTitle>
                </CardHeader>

                {/* Venue & Authors */}
                <CardContent className="p-0 space-y-3">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-400 leading-normal">
                    {pub.venue}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Authors:</span>{" "}
                    {pub.authors}
                  </p>
                </CardContent>
              </div>

              {/* Footer: Citations, DOI, & Read Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {pub.citations}
                  </span>
                  <span className="truncate max-w-[150px]" title={`DOI: ${pub.doi}`}>
                    DOI: {pub.doi}
                  </span>
                </div>

                <a
                  href={pub.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="group-hover:bg-blue-900 group-hover:text-white dark:group-hover:bg-blue-600 font-semibold transition-colors"
                    rightIcon={
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    }
                  >
                    Read Publication
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Publications Action Button */}
        <div className="flex justify-center pt-6">
          <Link href="#publications" passHref>
            <Button
              variant="primary"
              size="lg"
              className="px-8 shadow-md"
              rightIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              View All Publications
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};
