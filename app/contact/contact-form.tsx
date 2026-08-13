"use client";

import React, { useState } from "react";
import { fetcher } from "@/src/lib/api";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      await fetcher(`${apiUrl}/contact`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      if (error.response?.errors) {
        const newErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(error.response.errors)) {
          newErrors[key] = Array.isArray(val) ? (val as string[])[0] : (val as string);
        }
        setErrors(newErrors);
      } else {
        setServerError(error.message || "An error occurred while sending your message. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center h-full min-h-[300px]">
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h3 className="text-xl font-bold">Your message has been sent successfully.</h3>
        <p className="text-sm">We will get back to you shortly.</p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-slate-100 mb-6 font-sans">
        Send a Message
      </h2>
      
      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-950 border ${
              errors.name ? "border-red-500/50" : "border-slate-800"
            } rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-100 transition-colors`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-950 border ${
              errors.email ? "border-red-500/50" : "border-slate-800"
            } rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-100 transition-colors`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-950 border ${
              errors.subject ? "border-red-500/50" : "border-slate-800"
            } rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-100 transition-colors`}
            placeholder="Inquiry about..."
          />
          {errors.subject && (
            <p className="mt-1.5 text-sm text-red-400">{errors.subject}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-slate-950 border ${
              errors.message ? "border-red-500/50" : "border-slate-800"
            } rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-100 transition-colors resize-y`}
            placeholder="How can we help you?"
          />
          {errors.message && (
            <p className="mt-1.5 text-sm text-red-400">{errors.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </form>
    </div>
  );
}
