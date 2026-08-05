"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";
import { ProfileService } from "@/src/services/profile.service";
import { Spinner } from "@/src/components/ui/spinner";

export default function AdminProfilePage() {
  const router = useRouter();

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [university, setUniversity] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [biography, setBiography] = useState("");
  const [researchSummary, setResearchSummary] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [office, setOffice] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  // Media & Attachments State
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [existingCvUrl, setExistingCvUrl] = useState<string | null>(null);
  const [existingCvName, setExistingCvName] = useState<string | null>(null);

  // Authentication check & Initial profile data loading
  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const profile = await ProfileService.getProfile();
        if (profile) {
          setName(profile.name || "");
          setTitle(profile.title || "");
          setDesignation(profile.designation || "");
          setDepartment(profile.department || "");
          setUniversity(profile.university || "");
          setShortBio(profile.short_bio || "");
          setBiography(profile.biography || "");
          setResearchSummary(profile.research_summary || "");
          setEmail(profile.email || "");
          setPhone(profile.phone || "");
          setOffice(profile.office || "");
          setAddress(profile.address || "");
          setWebsite(profile.website || "");

          if (profile.profile_photo_url) {
            setExistingPhotoUrl(profile.profile_photo_url);
          }
          if (profile.cv_file_url) {
            setExistingCvUrl(profile.cv_file_url);
            setExistingCvName(profile.cv_file ? profile.cv_file.split("/").pop() || "Curriculum_Vitae.pdf" : "Curriculum_Vitae.pdf");
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load profile:", err);
        if (err instanceof Error) {
          setErrorMsg(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  // Handle Image Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle CV Selection
  const handleCvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setValidationErrors(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("title", title);
    formData.append("designation", designation);
    formData.append("department", department);
    formData.append("university", university);
    formData.append("short_bio", shortBio);
    formData.append("biography", biography);
    formData.append("research_summary", researchSummary);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("office", office);
    formData.append("address", address);
    formData.append("website", website);

    if (profilePhoto) {
      formData.append("profile_photo", profilePhoto);
    }
    if (cvFile) {
      formData.append("cv_file", cvFile);
    }

    try {
      const updated = await ProfileService.updateProfile(formData);
      setSuccessMsg("Professor profile updated successfully!");

      if (updated.profile_photo_url) {
        setExistingPhotoUrl(updated.profile_photo_url);
        setPhotoPreview(null);
        setProfilePhoto(null);
      }
      if (updated.cv_file_url) {
        setExistingCvUrl(updated.cv_file_url);
        setExistingCvName(updated.cv_file ? updated.cv_file.split("/").pop() || "Curriculum_Vitae.pdf" : "Curriculum_Vitae.pdf");
        setCvFile(null);
      }
    } catch (err: unknown) {
      if (err instanceof ApiValidationError) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setValidationErrors(err.errors);
        }
        setErrorMsg(err.message || "Validation error occurred while updating profile.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" variant="primary" />
        <p className="text-sm font-medium text-slate-400 animate-pulse font-mono">
          Loading professor profile data from API...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Title Banner & Save Action Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Profile Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Update academic bio, designations, contact details, profile photo, and CV document.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-semibold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isSaving ? (
            <>
              <Spinner size="sm" variant="primary" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Save Profile Changes</span>
            </>
          )}
        </button>
      </motion.div>

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Profile Photo & CV Attachments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Media & Attachments</h2>
              <p className="text-xs text-slate-400">Profile picture and downloadable CV document.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Profile Photo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Profile Photo
              </label>
              <div className="flex items-center gap-5">
                {/* Photo Preview Circle */}
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
                  {photoPreview || existingPhotoUrl ? (
                    <img
                      src={photoPreview || existingPhotoUrl!}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-slate-600">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    id="profile_photo_input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile_photo_input"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <span>Upload New Photo</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    JPG, PNG, WebP or SVG. Max size 5MB.
                  </p>
                </div>
              </div>
              {validationErrors?.profile_photo?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.profile_photo[0]}</p>
              )}
            </div>

            {/* Curriculum Vitae (CV) Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Curriculum Vitae (CV) Document
              </label>

              {existingCvUrl && !cvFile && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-400 shrink-0">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="truncate font-mono">{existingCvName}</span>
                  </div>
                  <a
                    href={existingCvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 text-xs font-medium underline shrink-0"
                  >
                    View File
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  id="cv_file_input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvSelect}
                  className="hidden"
                />
                <label
                  htmlFor="cv_file_input"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{cvFile ? cvFile.name : "Select PDF CV File"}</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Accepted formats: PDF, DOC, DOCX. Max size 10MB.
              </p>
              {validationErrors?.cv_file?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.cv_file[0]}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: General & Academic Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Academic & Faculty Information</h2>
              <p className="text-xs text-slate-400">Full name, academic rank, department, and university affiliation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="prof-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alex Morgan, Ph.D."
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.name?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.name[0]}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="prof-title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Academic Title
              </label>
              <input
                id="prof-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Professor & Chair of Artificial Intelligence"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.title?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.title[0]}</p>
              )}
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label htmlFor="prof-designation" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Faculty Designation
              </label>
              <input
                id="prof-designation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Full Professor"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.designation?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.designation[0]}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="prof-department" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Department
              </label>
              <input
                id="prof-department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department of Computer Science"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.department?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.department[0]}</p>
              )}
            </div>

            {/* University */}
            <div className="space-y-1.5">
              <label htmlFor="prof-university" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                University / Institution
              </label>
              <input
                id="prof-university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="University Faculty of Science & Engineering"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.university?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.university[0]}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: Biography & Research Focus */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Biography & Research Summary</h2>
              <p className="text-xs text-slate-400">Short intro bio, detailed academic biography, and core research mission.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Short Bio */}
            <div className="space-y-1.5">
              <label htmlFor="prof-shortbio" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Short Biography (Hero & Cards Intro)
              </label>
              <textarea
                id="prof-shortbio"
                rows={3}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                placeholder="Short 2-3 sentence overview of academic appointment and research focus..."
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all leading-relaxed"
              />
              {validationErrors?.short_bio?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.short_bio[0]}</p>
              )}
            </div>

            {/* Full Biography */}
            <div className="space-y-1.5">
              <label htmlFor="prof-biography" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Academic Biography
              </label>
              <textarea
                id="prof-biography"
                rows={6}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Comprehensive academic career biography..."
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all leading-relaxed"
              />
              {validationErrors?.biography?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.biography[0]}</p>
              )}
            </div>

            {/* Research Summary */}
            <div className="space-y-1.5">
              <label htmlFor="prof-research" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Research Summary & Philosophy
              </label>
              <textarea
                id="prof-research"
                rows={4}
                value={researchSummary}
                onChange={(e) => setResearchSummary(e.target.value)}
                placeholder="Key research methodology, safety verification goals, and laboratory direction..."
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all leading-relaxed"
              />
              {validationErrors?.research_summary?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.research_summary[0]}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 4: Contact & Office Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Contact & Office Details</h2>
              <p className="text-xs text-slate-400">Email, phone, office room number, physical address, and personal website.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="prof-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Official Email
              </label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@university.edu"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.email?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.email[0]}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Office Phone
              </label>
              <input
                id="prof-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.phone?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.phone[0]}</p>
              )}
            </div>

            {/* Office Room */}
            <div className="space-y-1.5">
              <label htmlFor="prof-office" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Office Location / Room
              </label>
              <input
                id="prof-office"
                type="text"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                placeholder="Engineering Building, Room 402"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.office?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.office[0]}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label htmlFor="prof-website" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Personal / Lab Website
              </label>
              <input
                id="prof-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://alexmorgan.ai"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.website?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.website[0]}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="prof-address" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Physical Campus Address
              </label>
              <textarea
                id="prof-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Department of Computer Science, University Faculty Campus, City, Country"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {validationErrors?.address?.[0] && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.address[0]}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" variant="primary" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
