"use client";
import { createPortal } from "react-dom";
import React, { useState, useEffect } from "react";
import { AuthService, ApiValidationError } from "@/src/services/auth.service";

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear fields and states when modal closes or opens
  const resetForm = () => {
    setCurrentPassword("");
    setPassword("");
    setPasswordConfirmation("");
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowPasswordConfirmation(false);
    setErrorMessage(null);
    setFieldErrors(null);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(null);
    setSuccessMessage(null);

    // Front-end basic validations
    if (!currentPassword) {
      setErrorMessage("Current password is required.");
      return;
    }
    if (!password) {
      setErrorMessage("New password is required.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.changePassword({
        current_password: currentPassword,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      setSuccessMessage(response.message || "Password updated successfully!");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");

      // Automatically close modal after 1.5 seconds on success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      if (err instanceof ApiValidationError) {
        setErrorMessage(err.message || "Failed to update password.");
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden">        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Change Password</h2>
              <p className="text-xs text-slate-400">Update your admin account password</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto"
        >
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 shrink-0 mt-0.5"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="current_password"
              className="block text-xs font-medium text-slate-300"
            >
              Current Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="current_password"
                name="current_password"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 pr-10 bg-slate-950/80 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors?.current_password
                  ? "border-rose-500/80 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors?.current_password && (
              <p className="text-[11px] text-rose-400">{fieldErrors.current_password[0]}</p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-300"
            >
              New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 pr-10 bg-slate-950/80 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors?.password
                  ? "border-rose-500/80 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors?.password && (
              <p className="text-[11px] text-rose-400">{fieldErrors.password[0]}</p>
            )}
          </div>

          {/* Password Confirmation Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="password_confirmation"
              className="block text-xs font-medium text-slate-300"
            >
              Confirm New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showPasswordConfirmation ? "text" : "password"}
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 pr-10 bg-slate-950/80 border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${fieldErrors?.password_confirmation
                  ? "border-rose-500/80 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPasswordConfirmation ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors?.password_confirmation && (
              <p className="text-[11px] text-rose-400">
                {fieldErrors.password_confirmation[0]}
              </p>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2 disabled:opacity-50 font-medium"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-slate-950"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    ,
    document.body
  );
};
