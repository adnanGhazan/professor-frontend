"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MeetingRequestService } from "@/src/services/meeting-request.service";
import { CreateMeetingRequestPayload } from "@/src/types/meeting-request";
import { ApiValidationError } from "@/src/services/auth.service";

interface BookMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Bangladesh",
  "Germany",
  "France",
  "Japan",
  "India",
  "Pakistan",
  "China",
  "Singapore",
  "Malaysia",
  "United Arab Emirates",
  "Saudi Arabia",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "South Korea",
  "Italy",
  "Spain",
  "Brazil",
  "South Africa",
  "Other",
];

const MEETING_PURPOSES = [
  "Academic Collaboration",
  "Research Inquiry",
  "Student Supervision / Mentorship",
  "Speaking / Guest Lecture",
  "Consultation / Advisory",
  "Media / Press Inquiry",
  "Other",
];

const COUNTRY_CODES = [
  { code: "+92", label: "🇵🇰 +92", country: "Pakistan" },
  { code: "+1", label: "🇺🇸 +1", country: "USA/Canada" },
  { code: "+44", label: "🇬🇧 +44", country: "UK" },
  { code: "+61", label: "🇦🇺 +61", country: "Australia" },
  { code: "+49", label: "🇩🇪 +49", country: "Germany" },
  { code: "+33", label: "🇫🇷 +33", country: "France" },
  { code: "+81", label: "🇯🇵 +81", country: "Japan" },
  { code: "+91", label: "🇮🇳 +91", country: "India" },
  { code: "+86", label: "🇨🇳 +86", country: "China" },
  { code: "+65", label: "🇸🇬 +65", country: "Singapore" },
  { code: "+60", label: "🇲🇾 +60", country: "Malaysia" },
  { code: "+971", label: "🇦🇪 +971", country: "UAE" },
  { code: "+966", label: "🇸🇦 +966", country: "Saudi Arabia" },
  { code: "+31", label: "🇳🇱 +31", country: "Netherlands" },
  { code: "+46", label: "🇸🇪 +46", country: "Sweden" },
  { code: "+41", label: "🇨🇭 +41", country: "Switzerland" },
  { code: "+82", label: "🇰🇷 +82", country: "South Korea" },
  { code: "+39", label: "🇮🇹 +39", country: "Italy" },
  { code: "+34", label: "🇪🇸 +34", country: "Spain" },
  { code: "+55", label: "🇧🇷 +55", country: "Brazil" },
  { code: "+27", label: "🇿🇦 +27", country: "South Africa" },
];

export const BookMeetingModal: React.FC<BookMeetingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initialFormData: CreateMeetingRequestPayload = {
    full_name: "",
    affiliation: "",
    email: "",
    country: "",
    phone: "",
    meeting_purpose: "",
    preferred_date: "",
    duration: 30,
    discussion_points: "",
  };

  const [formData, setFormData] = useState<CreateMeetingRequestPayload>(initialFormData);
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>("+92");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Minimum date for preferred_date is today
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value, 10) || 30 : value,
    }));
    // Clear inline error for this field on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setFieldErrors({});

    // Client-side quick checks
    const errors: Record<string, string[]> = {};
    if (!formData.full_name.trim()) errors.full_name = ["Full Name is required."];
    if (!formData.email.trim()) errors.email = ["Email Address is required."];
    if (!formData.country) errors.country = ["Please select your Country."];
    if (!formData.meeting_purpose) errors.meeting_purpose = ["Please select a Meeting Purpose."];
    if (!formData.preferred_date) errors.preferred_date = ["Preferred Meeting Date is required."];
    if (!formData.duration) errors.duration = ["Meeting Duration is required."];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg("Please fill in all required fields accurately.");
      setIsSubmitting(false);
      return;
    }

    const combinedPhone = phoneNumber.trim() ? `${phoneCountryCode} ${phoneNumber.trim()}` : "";
    const payload: CreateMeetingRequestPayload = {
      ...formData,
      phone: combinedPhone,
    };

    try {
      await MeetingRequestService.createMeetingRequest(payload);
      setIsSuccess(true);
      setFormData(initialFormData);
      setPhoneNumber("");
      setPhoneCountryCode("+92");
    } catch (err: any) {
      if (err instanceof ApiValidationError && err.errors) {
        setFieldErrors(err.errors);
      }
      setErrorMsg(err.message || "Failed to submit meeting request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setIsSuccess(false);
    setErrorMsg(null);
    setFieldErrors({});
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleModalClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] z-[101] my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              Book a Meeting
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fill out the form below to schedule a meeting.
            </p>
          </div>
          <button
            onClick={handleModalClose}
            disabled={isSubmitting}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Meeting Request Submitted Successfully!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you for reaching out. Your request has been received and is under review. You will receive an update via email.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  Book Another Meeting
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-5 py-2 text-sm font-medium bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form id="meeting-request-form" onSubmit={handleSubmit} className="space-y-4">
              {/* General Top Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm flex items-start gap-2.5">
                  <svg
                    className="w-5 h-5 shrink-0 text-red-500 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name & Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Prof. John Doe"
                    required
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${fieldErrors.full_name
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                      }`}
                  />
                  {fieldErrors.full_name && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.full_name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic / Professional Affiliation
                  </label>
                  <input
                    type="text"
                    name="affiliation"
                    value={formData.affiliation || ""}
                    onChange={handleChange}
                    placeholder="Department of AI, Stanford University"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors"
                  />
                  {fieldErrors.affiliation && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.affiliation[0]}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    required
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${fieldErrors.email
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                      }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      className="px-2.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors shrink-0 max-w-[125px] sm:max-w-[135px]"
                      aria-label="Country Dial Code"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={`${item.code}-${item.country}`} value={item.code}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone_number_input"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.phone;
                            return next;
                          });
                        }
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="300 1234567"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>
              </div>

              {/* Country & Meeting Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${fieldErrors.country
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                      }`}
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.country && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.country[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Purpose <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="meeting_purpose"
                    value={formData.meeting_purpose}
                    onChange={handleChange}
                    required
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${fieldErrors.meeting_purpose
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                      }`}
                  >
                    <option value="">Select Purpose</option>
                    {MEETING_PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.meeting_purpose && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.meeting_purpose[0]}</p>
                  )}
                </div>
              </div>

              {/* Preferred Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Meeting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    min={todayStr}
                    value={formData.preferred_date}
                    onChange={handleChange}
                    required
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${fieldErrors.preferred_date
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                      }`}
                  />
                  {fieldErrors.preferred_date && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.preferred_date[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${fieldErrors.duration
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                      }`}
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                  {fieldErrors.duration && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.duration[0]}</p>
                  )}
                </div>
              </div>

              {/* Brief Description / Discussion Points */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Description / Discussion Points
                </label>
                <textarea
                  name="discussion_points"
                  rows={3}
                  value={formData.discussion_points || ""}
                  onChange={handleChange}
                  placeholder="Outline the main topics or questions you would like to discuss..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors resize-none"
                />
                {fieldErrors.discussion_points && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.discussion_points[0]}</p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="meeting-request-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
