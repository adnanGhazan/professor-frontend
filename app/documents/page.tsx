"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { DocumentRecord } from "@/src/types/document";
import { DocumentService } from "@/src/services/document.service";
import { Container } from "@/src/components/ui/container";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

export default function PublicDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Fetch Public Documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DocumentService.getPublicDocuments();
      setDocuments(data);
    } catch (err: unknown) {
      console.error("Failed to load public documents:", err);
      setError("Unable to load documents and course resources at this time.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Helpers to identify document types
  const isLectureDoc = (doc: DocumentRecord) => {
    const type = doc.document_type?.trim().toLowerCase() || "";
    return type === "lecture" || type === "lectures" || type === "lecture notes";
  };

  const isSyllabusDoc = (doc: DocumentRecord) => {
    const type = doc.document_type?.trim().toLowerCase() || "";
    return type === "syllabus";
  };

  const isCvBioDoc = (doc: DocumentRecord) => {
    const type = doc.document_type?.trim().toLowerCase() || "";
    return type === "cv / bio" || type === "cv" || type === "bio" || type.includes("cv") || type.includes("bio");
  };

  // Available Document Type Filter Pills
  const availableTypes = useMemo(() => {
    const defaultTypes = ["All", "Lectures", "Syllabus", "CV / Bio", "Other"];
    const extraTypes = new Set<string>();
    documents.forEach((doc) => {
      if (
        doc.document_type &&
        !isLectureDoc(doc) &&
        !isSyllabusDoc(doc) &&
        !isCvBioDoc(doc) &&
        doc.document_type !== "Other"
      ) {
        extraTypes.add(doc.document_type);
      }
    });
    return [...defaultTypes, ...Array.from(extraTypes)];
  }, [documents]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Type Filter
      if (selectedType === "Lectures") {
        if (!isLectureDoc(doc)) return false;
      } else if (selectedType === "Syllabus") {
        if (!isSyllabusDoc(doc)) return false;
      } else if (selectedType === "CV / Bio") {
        if (!isCvBioDoc(doc)) return false;
      } else if (selectedType === "Other") {
        if (isLectureDoc(doc) || isSyllabusDoc(doc) || isCvBioDoc(doc)) return false;
      } else if (selectedType !== "All") {
        if (doc.document_type !== selectedType) return false;
      }

      // Search Filter (Title, Description, Lecture Category)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = doc.title ? doc.title.toLowerCase().includes(query) : false;
        const descMatch = doc.description ? doc.description.toLowerCase().includes(query) : false;
        const categoryMatch = doc.lecture_category ? doc.lecture_category.toLowerCase().includes(query) : false;
        return titleMatch || descMatch || categoryMatch;
      }
      return true;
    });
  }, [documents, selectedType, searchQuery]);

  // Group filtered documents into Lectures and Non-Lectures
  const { lectureDocs, nonLectureDocs, groupedLectures, sortedCategoryKeys } = useMemo(() => {
    const lectures: DocumentRecord[] = [];
    const nonLectures: DocumentRecord[] = [];
    const groups: Record<string, DocumentRecord[]> = {};

    filteredDocuments.forEach((doc) => {
      if (isLectureDoc(doc)) {
        lectures.push(doc);
        const category = doc.lecture_category?.trim() || "General Lectures";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(doc);
      } else {
        nonLectures.push(doc);
      }
    });

    const categoryKeys = Object.keys(groups).sort((a, b) => {
      if (a === "General Lectures") return 1;
      if (b === "General Lectures") return -1;
      return a.localeCompare(b);
    });

    return {
      lectureDocs: lectures,
      nonLectureDocs: nonLectures,
      groupedLectures: groups,
      sortedCategoryKeys: categoryKeys,
    };
  }, [filteredDocuments]);

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr.slice(0, 10);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  // Get file extension icon badge
  const getFileBadge = (ext?: string | null) => {
    const formatExt = (ext || "file").toLowerCase();
    let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
    let icon = "📄";

    if (formatExt === "pdf") {
      badgeStyle = "bg-red-500/10 text-red-400 border-red-500/30";
      icon = "📄";
    } else if (formatExt === "doc" || formatExt === "docx") {
      badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/30";
      icon = "📝";
    } else if (formatExt === "zip" || formatExt === "rar" || formatExt === "tar") {
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
      icon = "📦";
    } else if (formatExt === "ppt" || formatExt === "pptx") {
      badgeStyle = "bg-orange-500/10 text-orange-400 border-orange-500/30";
      icon = "📊";
    } else if (formatExt === "xls" || formatExt === "xlsx") {
      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      icon = "📊";
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${badgeStyle}`}>
        <span>{icon}</span>
        <span>{formatExt}</span>
      </span>
    );
  };

  // Render individual document card
  const renderDocumentCard = (doc: DocumentRecord) => {
    const formattedDate = formatDate(doc.published_at);
    const isLecture = isLectureDoc(doc);
    const categoryLabel = doc.lecture_category?.trim() || "General Lectures";

    return (
      <div
        key={doc.id}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-400/50 transition-all duration-300"
      >
        <div className="space-y-3">
          {/* Header Row: Document Type & Extension */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm" className="font-bold text-[10px] uppercase">
                {doc.document_type || "Resource"}
              </Badge>
              {isLecture && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {categoryLabel}
                </span>
              )}
            </div>
            {getFileBadge(doc.file_extension)}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug font-sans">
            {doc.title}
          </h3>

          {/* Description */}
          {doc.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {doc.description}
            </p>
          )}

          {/* Meta info: Published date & Original file name */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            {formattedDate ? <span>Published: {formattedDate}</span> : <span />}
            {doc.file_name && <span className="truncate max-w-[180px]">{doc.file_name}</span>}
          </div>
        </div>

        {/* Actions: Download & Open / View */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
          {doc.file_url ? (
            <>
              <a
                href={doc.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  <span>Download</span>
                </Button>
              </a>

              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="justify-center gap-1.5"
                >
                  <span>Open / View</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Button>
              </a>
            </>
          ) : (
            <span className="text-xs text-slate-500 font-mono">No download link available</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 sm:py-20 lg:py-28 transition-colors duration-200">
      <Container size="lg" padding="normal" className="space-y-12">
        {/* Page Heading */}
        <SectionHeading
          eyebrow="Academic Repository"
          title="Course Materials & Documents"
          description="Access downloadable syllabi, lecture notes, lab manuals, curriculum vitae, and official academic forms."
          align="center"
        />

        {/* Search & Document Type Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl shadow-lg">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title, description or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Document Type Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === type
                    ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/40 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse"
              >
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-full" />
                <div className="h-10 bg-slate-300 dark:bg-slate-800 rounded-xl w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!isLoading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <p className="text-sm font-medium text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchDocuments} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Retry Loading
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredDocuments.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              📂
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Documents Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery || selectedType !== "All"
                ? "No document records match your filter criteria. Try clearing search filters."
                : "Course resources and documents will be available soon."}
            </p>
          </div>
        )}

        {/* Documents Cards List */}
        {!isLoading && !error && filteredDocuments.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Lecture Documents Section (Grouped by Category) */}
            {lectureDocs.length > 0 && (
              <div className="space-y-8">
                {selectedType === "All" && nonLectureDocs.length > 0 && (
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      Lectures
                    </h2>
                  </div>
                )}
                {sortedCategoryKeys.map((category) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {category}
                      </h3>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                        {groupedLectures[category].length} {groupedLectures[category].length === 1 ? "document" : "documents"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groupedLectures[category].map((doc) => renderDocumentCard(doc))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Non-Lecture Documents Section */}
            {nonLectureDocs.length > 0 && (
              <div className="space-y-4">
                {selectedType === "All" && lectureDocs.length > 0 && (
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      Other Documents & Resources
                    </h2>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nonLectureDocs.map((doc) => renderDocumentCard(doc))}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

