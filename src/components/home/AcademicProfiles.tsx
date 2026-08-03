import React from "react";

export interface AcademicProfileItem {
  name: string;
  id: string;
  url: string;
  statLabel: string;
  statValue: string;
  icon: React.ReactNode;
  badgeColor: string;
}

export interface AcademicProfilesProps {
  googleScholarUrl?: string;
  scopusUrl?: string;
  orcidUrl?: string;
  researchGateUrl?: string;
  className?: string;
}

export const AcademicProfiles: React.FC<AcademicProfilesProps> = ({
  googleScholarUrl = "https://scholar.google.com",
  scopusUrl = "https://www.scopus.com",
  orcidUrl = "https://orcid.org",
  researchGateUrl = "https://www.researchgate.net",
  className = "",
}) => {
  const profiles: AcademicProfileItem[] = [
    {
      name: "Google Scholar",
      id: "google_scholar_url",
      url: googleScholarUrl,
      statLabel: "Citations",
      statValue: "12,450+",
      badgeColor: "from-blue-600 to-indigo-600 text-white",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l12 9.5 12-9.5L12 0zm-8.4 12v3.6L12 21.6l8.4-6V12L12 18.6 3.6 12z" />
        </svg>
      ),
    },
    {
      name: "Scopus",
      id: "scopus_url",
      url: scopusUrl,
      statLabel: "Author ID",
      statValue: "5720019283",
      badgeColor: "from-amber-600 to-orange-600 text-white",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 7h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3h-2v-6h2v1.1c.37-.63 1.05-1.1 1.83-1.1 1.19 0 2.17.98 2.17 2.17V17z" />
        </svg>
      ),
    },
    {
      name: "ORCID",
      id: "orcid_url",
      url: orcidUrl,
      statLabel: "ORCID iD",
      statValue: "0000-0002-1825-0097",
      badgeColor: "from-emerald-600 to-teal-600 text-white",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.516.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.434h2.238c2.438 0 3.825-1.5 3.825-3.713 0-2.053-1.256-3.721-3.713-3.721h-2.35z" />
        </svg>
      ),
    },
    {
      name: "ResearchGate",
      id: "researchgate_url",
      url: researchGateUrl,
      statLabel: "RG Score",
      statValue: "42.8",
      badgeColor: "from-teal-600 to-cyan-600 text-white",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472H4.46C3.104 24 2 22.896 2 21.528V2.472C2 1.104 3.104 0 4.46 0h15.08zM17.5 13.5h-3.2v-2.1h3.2c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-5.2v10.1h2v-3.5h3.2c1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5h-7.2v10.1h2V7.4h5.2c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {profiles.map((profile) => (
        <a
          key={profile.name}
          href={profile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br ${profile.badgeColor} shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0`}
            >
              {profile.icon}
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
                {profile.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {profile.statLabel}: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile.statValue}</span>
              </span>
            </div>
          </div>

          <svg
            className="w-4 h-4 text-slate-400 group-hover:text-blue-900 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      ))}
    </div>
  );
};
