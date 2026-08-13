"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StatCard } from "@/src/components/admin/StatCard";
import { fetcher } from "@/src/lib/api";
import { env } from "@/src/lib/env";
import { AuthService } from "@/src/services/auth.service";

const Icons = {
  Publications: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" /></svg>
  ),
  Students: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  Projects: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2.5H4a2 2 0 0 0-2 2v13.5a2 2 0 0 0 2 2Z" /></svg>
  ),
  Awards: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
  ),
  News: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
  ),
  Videos: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
  ),
  Gallery: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
  ),
  Areas: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" /></svg>
  ),
  Educations: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
  ),
  Experiences: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 12h.01" /><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M22 13a18.15 18.15 0 0 1-20 0" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>
  ),
  Teachings: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
  ),
  Documents: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
  ),
};

type EndpointsType = {
  [key: string]: string;
};

const endpoints: EndpointsType = {
  publications: "/publications",
  students: "/students",
  researchProjects: "/research-projects",
  awards: "/awards",
  news: "/news",
  videos: "/videos",
  gallery: "/gallery",
  researchAreas: "/research-areas",
  educations: "/educations",
  experiences: "/experiences",
  teachings: "/teachings",
  documents: "/documents",
};

interface DashboardData {
  counts: Record<string, number | null>;
  recent: {
    publications: any[];
    news: any[];
    videos: any[];
    researchProjects: any[];
  };
}

const getCount = (response: any) => {
  if (response?.data?.pagination?.total !== undefined) {
    return response.data.pagination.total;
  }
  if (response?.data?.items && Array.isArray(response.data.items)) {
    return response.data.items.length;
  }
  if (Array.isArray(response?.data)) {
    return response.data.length;
  }
  return 0;
};

const formatCount = (count: number | null | undefined) => {
  if (count === null || count === undefined) return "Unavailable";
  return new Intl.NumberFormat("en-US").format(count);
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    counts: {},
    recent: { publications: [], news: [], videos: [], researchProjects: [] },
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const token = AuthService.getToken();

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setLoading(true);

    const baseUrl = env.NEXT_PUBLIC_API_BASE_URL || "";

    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const keys = Object.keys(endpoints);

    const promises = keys.map((key) =>
      fetcher<any>(`${baseUrl}${endpoints[key]}`, fetchOptions)
    );

    const results = await Promise.allSettled(promises);
    const newCounts: Record<string, number | null> = {};
    const newRecent = {
      publications: [] as any[],
      news: [] as any[],
      videos: [] as any[],
      researchProjects: [] as any[],
    };

    results.forEach((result, index) => {
      const key = keys[index];
      if (result.status === "fulfilled") {
        newCounts[key] = getCount(result.value);

        // Extract recent items (up to 5)
        let items = [];
        if (result.value?.data?.items && Array.isArray(result.value.data.items)) {
          items = result.value.data.items.slice(0, 5);
        } else if (Array.isArray(result.value?.data)) {
          items = result.value.data.slice(0, 5);
        }

        if (key === "publications") newRecent.publications = items;
        if (key === "news") newRecent.news = items;
        if (key === "videos") newRecent.videos = items;
        if (key === "researchProjects") newRecent.researchProjects = items;
      } else {
        newCounts[key] = null;
      }
    });

    setData({ counts: newCounts, recent: newRecent });
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    { key: "publications", title: "Publications", label: "Peer-reviewed Papers", icon: Icons.Publications, delay: 0.1 },
    { key: "students", title: "Students", label: "Active Scholars", icon: Icons.Students, delay: 0.2 },
    { key: "researchProjects", title: "Projects", label: "Funded Grants", icon: Icons.Projects, delay: 0.3 },
    { key: "awards", title: "Awards", label: "Academic Honors", icon: Icons.Awards, delay: 0.4 },
    { key: "news", title: "News", label: "Announcements", icon: Icons.News, delay: 0.5 },
    { key: "videos", title: "Videos", label: "Media Coverage", icon: Icons.Videos, delay: 0.6 },
    { key: "gallery", title: "Gallery", label: "Visual Assets", icon: Icons.Gallery, delay: 0.7 },
    { key: "researchAreas", title: "Areas", label: "Research Domains", icon: Icons.Areas, delay: 0.8 },
  ];

  const secondaryStats = [
    { key: "educations", title: "Education Records", icon: Icons.Educations },
    { key: "experiences", title: "Experience Records", icon: Icons.Experiences },
    { key: "teachings", title: "Teaching Courses", icon: Icons.Teachings },
    { key: "documents", title: "Documents", icon: Icons.Documents },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Title Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overview of academic performance, active research, and portfolio statistics.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Status: Online</span>
        </div>
      </motion.div>

      {/* Main Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          loading ? (
            <div key={i} className="animate-pulse bg-slate-900/70 border border-slate-800/80 rounded-2xl h-32" />
          ) : (
            <StatCard
              key={i}
              title={stat.title}
              value={formatCount(data.counts[stat.key])}
              label={stat.label}
              icon={stat.icon}
              delay={stat.delay}
            />
          )
        ))}
      </div>

      {/* Action / Retry Bar */}
      {Object.values(data.counts).includes(null) && !loading && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm">Some dashboard data is currently unavailable.</span>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-sm transition-colors"
          >
            Retry Failed
          </button>
        </div>
      )}

      {/* Secondary Statistics & Recent Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Secondary Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Additional Records</h3>
            <div className="space-y-4">
              {secondaryStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-300">{stat.title}</span>
                  </div>
                  {loading ? (
                    <div className="w-10 h-6 bg-slate-700/50 animate-pulse rounded" />
                  ) : (
                    <span className="font-mono text-lg font-bold text-slate-100">
                      {formatCount(data.counts[stat.key])}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Publications */}
            <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Latest Publications
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
                  ))
                ) : data.recent.publications.length > 0 ? (
                  data.recent.publications.map((pub: any) => (
                    <div key={pub.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                      <p className="text-sm font-medium text-slate-300 line-clamp-1">{pub.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">{pub.year || 'N/A'}</span>
                        {pub.status && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {pub.status}
                          </span>
                        )}
                        {pub.is_featured && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No recent publications</p>
                )}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Latest Projects
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
                  ))
                ) : data.recent.researchProjects.length > 0 ? (
                  data.recent.researchProjects.map((proj: any) => (
                    <div key={proj.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                      <p className="text-sm font-medium text-slate-300 line-clamp-1">{proj.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">{proj.status || 'Current'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No recent projects</p>
                )}
              </div>
            </div>

            {/* Recent News */}
            <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                Latest News
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
                  ))
                ) : data.recent.news.length > 0 ? (
                  data.recent.news.map((n: any) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                      <p className="text-sm font-medium text-slate-300 line-clamp-1">{n.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {n.status && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {n.status}
                          </span>
                        )}
                        {n.is_published && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No recent news</p>
                )}
              </div>
            </div>

            {/* Recent Videos */}
            <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                Latest Videos
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
                  ))
                ) : data.recent.videos.length > 0 ? (
                  data.recent.videos.map((vid: any) => (
                    <div key={vid.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                      <p className="text-sm font-medium text-slate-300 line-clamp-1">{vid.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {vid.is_visible && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                            Visible
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No recent videos</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
