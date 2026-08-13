"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { SkillService } from "@/src/services/skill.service";
import { SkillCategory, SkillItem } from "@/src/types/skill";
import { Spinner } from "@/src/components/ui/spinner";
import { EmptyState } from "@/src/components/ui/empty-state";

export default function AdminSkillsPage() {
  const router = useRouter();

  // Loading & State
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Banners
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // --- Skill Category Modal State ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState<number | string>(1);
  const [categoryIsVisible, setCategoryIsVisible] = useState(true);

  // Category Delete State
  const [deletingCategory, setDeletingCategory] = useState<SkillCategory | null>(null);

  // --- Skill Item Modal State ---
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState<number | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDisplayOrder, setItemDisplayOrder] = useState<number | string>(1);
  const [itemIsVisible, setItemIsVisible] = useState(true);

  // Skill Item Delete State
  const [deletingItem, setDeletingItem] = useState<SkillItem | null>(null);

  // Fetch Categories & Embedded Items
  const fetchCategoriesList = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await SkillService.getAdminSkillCategories();
      // Sort categories by display_order
      const sortedData = [...data].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
      // Sort skill items within each category
      sortedData.forEach((cat) => {
        if (cat.skill_items && Array.isArray(cat.skill_items)) {
          cat.skill_items.sort(
            (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
          );
        }
      });
      setCategories(sortedData);
    } catch (err: unknown) {
      console.error("Failed to fetch skill categories:", err);
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
    fetchCategoriesList();
  }, [router, fetchCategoriesList]);

  // --- CATEGORY ACTIONS ---
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryTitle("");
    setCategoryDisplayOrder(categories.length + 1);
    setCategoryIsVisible(true);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: SkillCategory) => {
    setEditingCategoryId(cat.id);
    setCategoryTitle(cat.title || "");
    setCategoryDisplayOrder(cat.display_order ?? 1);
    setCategoryIsVisible(cat.is_visible !== false);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors(null);

    const payload: Partial<SkillCategory> = {
      title: categoryTitle,
      display_order: parseInt(String(categoryDisplayOrder), 10) || 1,
      is_visible: categoryIsVisible,
    };

    try {
      if (editingCategoryId) {
        await SkillService.updateSkillCategory(editingCategoryId, payload);
        setSuccessMsg(`Category "${categoryTitle}" updated successfully!`);
      } else {
        await SkillService.createSkillCategory(payload);
        setSuccessMsg(`Category "${categoryTitle}" created successfully!`);
      }
      setIsCategoryModalOpen(false);
      fetchCategoriesList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors) setValidationErrors(err.errors);
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save category.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await SkillService.deleteSkillCategory(deletingCategory.id);
      setSuccessMsg(`Category "${deletingCategory.title}" deleted successfully!`);
      setDeletingCategory(null);
      fetchCategoriesList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete category.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SKILL ITEM ACTIONS ---
  const handleOpenAddItem = (categoryId: number, currentItemCount: number = 0) => {
    setEditingItemId(null);
    setItemCategoryId(categoryId);
    setItemTitle("");
    setItemDisplayOrder(currentItemCount + 1);
    setItemIsVisible(true);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: SkillItem) => {
    setEditingItemId(item.id);
    setItemCategoryId(item.skill_category_id);
    setItemTitle(item.title || "");
    setItemDisplayOrder(item.display_order ?? 1);
    setItemIsVisible(item.is_visible !== false);
    setValidationErrors(null);
    setErrorMsg(null);
    setIsItemModalOpen(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCategoryId) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors(null);

    const payload: Partial<SkillItem> = {
      skill_category_id: itemCategoryId,
      title: itemTitle,
      display_order: parseInt(String(itemDisplayOrder), 10) || 1,
      is_visible: itemIsVisible,
    };

    try {
      if (editingItemId) {
        await SkillService.updateSkillItem(editingItemId, payload);
        setSuccessMsg(`Skill "${itemTitle}" updated successfully!`);
      } else {
        await SkillService.createSkillItem(payload);
        setSuccessMsg(`Skill "${itemTitle}" created successfully!`);
      }
      setIsItemModalOpen(false);
      fetchCategoriesList();
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors) setValidationErrors(err.errors);
        setErrorMsg(err.message || "Validation error occurred.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save skill item.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await SkillService.deleteSkillItem(deletingItem.id);
      setSuccessMsg(`Skill "${deletingItem.title}" deleted successfully!`);
      setDeletingItem(null);
      fetchCategoriesList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete skill item.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Skills & Expertise Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize core skill categories and individual tech competencies.
          </p>
        </div>

        <button
          onClick={handleOpenAddCategory}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span>Add Skill Category</span>
        </button>
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
            Fetching skill categories and items...
          </p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Skill Categories Registered"
          description="Click 'Add Skill Category' to start organizing skills into groups."
        />
      ) : (
        /* CATEGORY CARDS / LIST */
        <div className="space-y-8">
          {categories.map((category) => {
            const items = category.skill_items || [];
            return (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      {category.display_order ?? 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold text-slate-100">{category.title}</h2>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                            category.is_visible !== false
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${category.is_visible !== false ? "bg-emerald-400" : "bg-slate-500"}`} />
                          {category.is_visible !== false ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        Contains {items.length} skill {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddItem(category.id, items.length)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      <span>Add Skill Item</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditCategory(category)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Edit Category
                    </button>
                    <button
                      onClick={() => setDeletingCategory(category)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
                    >
                      Delete Category
                    </button>
                  </div>
                </div>

                {/* Skill Items List */}
                {items.length === 0 ? (
                  <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/50">
                    <p className="text-xs text-slate-400 font-mono">
                      No skill items in this category yet. Click &apos;Add Skill Item&apos; above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="font-semibold text-xs text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase border ${
                              item.is_visible !== false
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800 text-slate-500 border-slate-700"
                            }`}
                          >
                            {item.is_visible !== false ? "Visible" : "Hidden"}
                          </span>

                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Edit Item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Delete Item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CATEGORY CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsCategoryModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar z-10 my-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {editingCategoryId ? "Edit Skill Category" : "Add Skill Category"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingCategoryId ? "Update group title and visibility." : "Create a new group for skills."}
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitCategory} className="space-y-5">
                {/* Category Title */}
                <div className="space-y-1">
                  <label htmlFor="cat-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Category Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="cat-title"
                    type="text"
                    required
                    value={categoryTitle}
                    onChange={(e) => setCategoryTitle(e.target.value)}
                    placeholder="e.g. Programming Languages & Tooling"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                  {validationErrors?.title?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                  )}
                </div>

                {/* Display Order */}
                <div className="space-y-1">
                  <label htmlFor="cat-displayorder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    id="cat-displayorder"
                    type="number"
                    value={categoryDisplayOrder}
                    onChange={(e) => setCategoryDisplayOrder(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                  {validationErrors?.display_order?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.display_order[0]}</p>
                  )}
                </div>

                {/* Visibility Checkbox */}
                <div className="space-y-1 flex items-center pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={categoryIsVisible}
                      onChange={(e) => setCategoryIsVisible(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Visible on Public Website
                    </span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" variant="primary" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingCategoryId ? "Update Category" : "Create Category"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setDeletingCategory(null)}
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
                  <h3 className="text-lg font-bold text-slate-100">Delete Category</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                Are you sure you want to delete category{" "}
                <strong className="text-slate-100">{deletingCategory.title}</strong> and all its associated skill items?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setDeletingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDeleteCategory}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" variant="primary" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Category</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SKILL ITEM CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsItemModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar z-10 my-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {editingItemId ? "Edit Skill Item" : "Add Skill Item"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingItemId ? "Modify skill title or visibility." : "Add a new skill entry to this category."}
                  </p>
                </div>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitItem} className="space-y-5">
                {/* Skill Item Title */}
                <div className="space-y-1">
                  <label htmlFor="item-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Skill Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="item-title"
                    type="text"
                    required
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder="e.g. Python & PyTorch, Docker, Next.js"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                  {validationErrors?.title?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
                  )}
                </div>

                {/* Display Order */}
                <div className="space-y-1">
                  <label htmlFor="item-displayorder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    id="item-displayorder"
                    type="number"
                    value={itemDisplayOrder}
                    onChange={(e) => setItemDisplayOrder(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                  {validationErrors?.display_order?.[0] && (
                    <p className="text-xs text-red-400 font-medium">{validationErrors.display_order[0]}</p>
                  )}
                </div>

                {/* Visibility Checkbox */}
                <div className="space-y-1 flex items-center pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={itemIsVisible}
                      onChange={(e) => setItemIsVisible(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Visible on Public Website
                    </span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" variant="primary" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingItemId ? "Update Skill Item" : "Create Skill Item"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SKILL ITEM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setDeletingItem(null)}
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
                  <h3 className="text-lg font-bold text-slate-100">Delete Skill Item</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                Are you sure you want to delete skill item{" "}
                <strong className="text-slate-100">{deletingItem.title}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDeleteItem}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" variant="primary" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Skill Item</span>
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
