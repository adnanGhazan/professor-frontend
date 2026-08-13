"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { ResearchVisionService } from "@/src/services/research-vision.service";
import { ResearchVision, ResearchMethodology } from "@/src/types/research-vision";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminResearchVisionPage() {
  const router = useRouter();

  // Loading & State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingVision, setIsSubmittingVision] = useState(false);
  const [isSubmittingMethodology, setIsSubmittingMethodology] = useState(false);

  // Status Banners
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Vision State
  const [visionId, setVisionId] = useState<number | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [visionIsVisible, setVisionIsVisible] = useState(true);

  // Methodologies State
  const [methodologies, setMethodologies] = useState<ResearchMethodology[]>([]);

  // Methodology Modal State
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [editingMethodologyId, setEditingMethodologyId] = useState<number | null>(null);
  const [methodologyTitle, setMethodologyTitle] = useState("");
  const [methodologyDescription, setMethodologyDescription] = useState("");
  const [methodologyFooterText, setMethodologyFooterText] = useState("");
  const [methodologyIconKey, setMethodologyIconKey] = useState("");
  const [methodologyDisplayOrder, setMethodologyDisplayOrder] = useState<number | string>(1);
  const [methodologyIsVisible, setMethodologyIsVisible] = useState(true);

  // Methodology Delete Confirmation State
  const [deletingMethodology, setDeletingMethodology] = useState<ResearchMethodology | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const vision = await ResearchVisionService.getAdminResearchVision();
      if (vision) {
        setVisionId(vision.id);
        setSectionTitle(vision.section_title || "");
        setSectionSubtitle(vision.section_subtitle || "");
        setSummary(vision.summary || "");
        setBadgeText(vision.badge_text || "");
        setVisionIsVisible(vision.is_visible !== false);

        if (vision.methodologies && Array.isArray(vision.methodologies)) {
          setMethodologies(
            [...vision.methodologies].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          );
        } else {
          // Fetch methodologies directly if not included
          const methList = await ResearchVisionService.getAdminMethodologies(vision.id);
          setMethodologies(
            [...methList].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          );
        }
      }
    } catch (err: unknown) {
      console.error("Failed to fetch research vision:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auth check & mount
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [router, fetchData]);

  // Save Main Research Vision Fields
  const handleSaveVision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVision(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors(null);

    const payload: Partial<ResearchVision> = {
      section_title: sectionTitle || null,
      section_subtitle: sectionSubtitle || null,
      summary: summary || null,
      badge_text: badgeText || null,
      is_visible: visionIsVisible,
    };

    try {
      const updated = await ResearchVisionService.updateResearchVision(payload);
      if (updated?.id) {
        setVisionId(updated.id);
      }
      setSuccessMsg("Research Vision section updated successfully!");
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors) setValidationErrors(err.errors);
        setErrorMsg(err.message || "Validation error occurred while saving vision.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save Research Vision.");
      }
    } finally {
      setIsSubmittingVision(false);
    }
  };

  // Open Methodology Modal for Add
  const handleOpenAddMethodology = () => {
    setEditingMethodologyId(null);
    setMethodologyTitle("");
    setMethodologyDescription("");
    setMethodologyFooterText("");
    setMethodologyIconKey("");
    setMethodologyDisplayOrder(methodologies.length + 1);
    setMethodologyIsVisible(true);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsMethodologyModalOpen(true);
  };

  // Open Methodology Modal for Edit
  const handleOpenEditMethodology = (item: ResearchMethodology) => {
    setEditingMethodologyId(item.id);
    setMethodologyTitle(item.title || "");
    setMethodologyDescription(item.description || "");
    setMethodologyFooterText(item.footer_text || "");
    setMethodologyIconKey(item.icon_key || "");
    setMethodologyDisplayOrder(item.display_order ?? 1);
    setMethodologyIsVisible(item.is_visible !== false);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsMethodologyModalOpen(true);
  };

  // Save Methodology (Add or Edit)
  const handleSubmitMethodology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionId) {
      setErrorMsg("Please save the main Research Vision section first before adding methodologies.");
      return;
    }

    setIsSubmittingMethodology(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors(null);

    const payload: Partial<ResearchMethodology> = {
      research_vision_id: visionId,
      title: methodologyTitle,
      description: methodologyDescription || null,
      footer_text: methodologyFooterText || null,
      icon_key: methodologyIconKey || null,
      display_order: parseInt(String(methodologyDisplayOrder), 10) || 1,
      is_visible: methodologyIsVisible,
    };

    try {
      if (editingMethodologyId) {
        await ResearchVisionService.updateMethodology(editingMethodologyId, payload);
        setSuccessMsg("Research methodology updated successfully!");
      } else {
        await ResearchVisionService.createMethodology(payload);
        setSuccessMsg("Research methodology created successfully!");
      }

      setIsMethodologyModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors) setValidationErrors(err.errors);
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save methodology.");
      }
    } finally {
      setIsSubmittingMethodology(false);
    }
  };

  // Execute Methodology Delete
  const handleConfirmDeleteMethodology = async () => {
    if (!deletingMethodology) return;
    setIsSubmittingMethodology(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await ResearchVisionService.deleteMethodology(deletingMethodology.id);
      setSuccessMsg(`Methodology "${deletingMethodology.title}" deleted successfully!`);
      setDeletingMethodology(null);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete methodology.");
      }
    } finally {
      setIsSubmittingMethodology(false);
    }
  };

  // Reorder Methodology by moving up/down
  const handleReorderMethodology = async (item: ResearchMethodology, direction: "up" | "down") => {
    const currentIndex = methodologies.findIndex((m) => m.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= methodologies.length) return;

    const targetItem = methodologies[targetIndex];

    const newOrderCurrent = targetItem.display_order;
    const newOrderTarget = item.display_order;

    setIsLoading(true);
    try {
      await Promise.all([
        ResearchVisionService.updateMethodology(item.id, { display_order: newOrderCurrent }),
        ResearchVisionService.updateMethodology(targetItem.id, { display_order: newOrderTarget }),
      ]);
      setSuccessMsg("Methodology display order updated!");
      fetchData();
    } catch (err: unknown) {
      console.error("Reorder failed:", err);
      if (err instanceof Error) setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Research Vision & Methodology
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your overarching research vision statement, badge text, and methodology pillars.
          </p>
        </div>
      </div>

      {/* Success Alert Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Error Alert Banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Spinner size="lg" variant="primary" />
          <p className="text-sm font-medium text-slate-400 animate-pulse font-mono">
            Loading Research Vision data...
          </p>
        </div>
      ) : (
        <>
          {/* SECTION 1: MAIN RESEARCH VISION FIELDS */}
          <section className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-400">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Main Section Settings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure the primary title, subtitle, badge, summary, and public visibility.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveVision} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Section Title */}
                <div className="space-y-1">
                  <label htmlFor="rv-section-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Section Title
                  </label>
                  <input
                    id="rv-section-title"
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. Research Vision & Philosophy"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                  {validationErrors?.section_title?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.section_title[0]}</p>
                  )}
                </div>

                {/* Badge Text */}
                <div className="space-y-1">
                  <label htmlFor="rv-badge-text" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Badge / Tagline Text
                  </label>
                  <input
                    id="rv-badge-text"
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Innovation Strategy"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                  {validationErrors?.badge_text?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.badge_text[0]}</p>
                  )}
                </div>

                {/* Section Subtitle */}
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="rv-section-subtitle" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Section Subtitle
                  </label>
                  <input
                    id="rv-section-subtitle"
                    type="text"
                    value={sectionSubtitle}
                    onChange={(e) => setSectionSubtitle(e.target.value)}
                    placeholder="e.g. Pioneering safe AI architectures for autonomous decision systems."
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                  {validationErrors?.section_subtitle?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.section_subtitle[0]}</p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="rv-summary" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Detailed Vision Summary
                  </label>
                  <textarea
                    id="rv-summary"
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Comprehensive description of your research mission, objectives, and broad impact..."
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                  />
                  {validationErrors?.summary?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.summary[0]}</p>
                  )}
                </div>

                {/* Visibility */}
                <div className="space-y-1 flex items-center pt-2 sm:col-span-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={visionIsVisible}
                      onChange={(e) => setVisionIsVisible(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Visible on Public Website
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-800/80">
                <button
                  type="submit"
                  disabled={isSubmittingVision}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  {isSubmittingVision ? (
                    <>
                      <Spinner size="sm" variant="primary" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Vision Settings</span>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 2: RESEARCH METHODOLOGY CARDS */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-400">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  Research Methodologies ({methodologies.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage the methodology cards, icons, descriptions, and custom display ordering.
                </p>
              </div>

              <button
                onClick={handleOpenAddMethodology}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span>Add Methodology</span>
              </button>
            </div>

            {methodologies.length === 0 ? (
              <EmptyState
                title="No Research Methodologies Registered"
                description="Click 'Add Methodology' to define your core research approaches and methodologies."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {methodologies.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Icon, Visibility & Order */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                            {item.icon_key ? item.icon_key.slice(0, 3).toUpperCase() : "M"}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            Order #{item.display_order ?? idx + 1}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            item.is_visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_visible !== false ? "bg-emerald-400" : "bg-slate-500"}`} />
                          {item.is_visible !== false ? "Visible" : "Hidden"}
                        </span>
                      </div>

                      {/* Title & Icon key */}
                      <div>
                        <h3 className="font-bold text-slate-100 text-base group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.icon_key && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            icon: <span className="text-amber-400">{item.icon_key}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {/* Footer Text */}
                      {item.footer_text && (
                        <div className="text-[11px] font-medium text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                          {item.footer_text}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleReorderMethodology(item, "up")}
                          title="Move Up"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-colors"
                        >
                          ↑
                        </button>
                        <button
                          disabled={idx === methodologies.length - 1}
                          onClick={() => handleReorderMethodology(item, "down")}
                          title="Move Down"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-colors"
                        >
                          ↓
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditMethodology(item)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingMethodology(item)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* METHODOLOGY CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isMethodologyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingMethodology && setIsMethodologyModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar z-10 my-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {editingMethodologyId ? "Edit Methodology Card" : "Add Methodology Card"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingMethodologyId
                      ? "Modify title, description, icon, or display order."
                      : "Create a new research methodology pillar."}
                  </p>
                </div>
                <button
                  onClick={() => setIsMethodologyModalOpen(false)}
                  disabled={isSubmittingMethodology}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitMethodology} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="m-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Title <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="m-title"
                      type="text"
                      required
                      value={methodologyTitle}
                      onChange={(e) => setMethodologyTitle(e.target.value)}
                      placeholder="e.g. Formal Verification & Safety Proofs"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.title?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                    )}
                  </div>

                  {/* Icon Key */}
                  <div className="space-y-1">
                    <label htmlFor="m-iconkey" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Icon Key
                    </label>
                    <input
                      id="m-iconkey"
                      type="text"
                      value={methodologyIconKey}
                      onChange={(e) => setMethodologyIconKey(e.target.value)}
                      placeholder="e.g. shield, cpu, code, layers"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                    {validationErrors?.icon_key?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.icon_key[0]}</p>
                    )}
                  </div>

                  {/* Display Order */}
                  <div className="space-y-1">
                    <label htmlFor="m-displayorder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Display Order
                    </label>
                    <input
                      id="m-displayorder"
                      type="number"
                      value={methodologyDisplayOrder}
                      onChange={(e) => setMethodologyDisplayOrder(e.target.value)}
                      placeholder="1"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                    {validationErrors?.display_order?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.display_order[0]}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="m-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      id="m-description"
                      rows={3}
                      value={methodologyDescription}
                      onChange={(e) => setMethodologyDescription(e.target.value)}
                      placeholder="Brief overview of how this methodology is applied..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                    />
                    {validationErrors?.description?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.description[0]}</p>
                    )}
                  </div>

                  {/* Footer Text */}
                  <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="m-footertext" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Footer Text / Tagline
                    </label>
                    <input
                      id="m-footertext"
                      type="text"
                      value={methodologyFooterText}
                      onChange={(e) => setMethodologyFooterText(e.target.value)}
                      placeholder="e.g. Applied across 12 high-assurance benchmarks"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                    />
                    {validationErrors?.footer_text?.[0] && (
                      <p className="text-xs text-red-400 font-medium">{validationErrors.footer_text[0]}</p>
                    )}
                  </div>

                  {/* Visibility Checkbox */}
                  <div className="space-y-1 flex items-center pt-2 sm:col-span-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={methodologyIsVisible}
                        onChange={(e) => setMethodologyIsVisible(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        Visible on Public Website
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={isSubmittingMethodology}
                    onClick={() => setIsMethodologyModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingMethodology}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmittingMethodology ? (
                      <>
                        <Spinner size="sm" variant="primary" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingMethodologyId ? "Update Methodology" : "Create Methodology"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* METHODOLOGY DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingMethodology && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingMethodology && setDeletingMethodology(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Confirm Deletion</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                Are you sure you want to delete the methodology{" "}
                <strong className="text-slate-100">{deletingMethodology.title}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingMethodology}
                  onClick={() => setDeletingMethodology(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingMethodology}
                  onClick={handleConfirmDeleteMethodology}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingMethodology ? (
                    <>
                      <Spinner size="sm" variant="primary" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Methodology</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
