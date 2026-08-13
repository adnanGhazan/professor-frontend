"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { AuthService } from "@/src/services/auth.service";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SiteSettingsMap } from "@/src/types/site-setting";
import { Spinner } from "@/src/components/ui/spinner";

export default function AdminSettingsPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Keep existing settings so saving this section does not remove
    // unrelated site settings.
    const [existingSettings, setExistingSettings] =
        useState<SiteSettingsMap>({});

    // Office & Contact CMS Fields
    const [officeRoom, setOfficeRoom] = useState("");
    const [officeBuilding, setOfficeBuilding] = useState("");
    const [campusAddress, setCampusAddress] = useState("");
    const [officePhone, setOfficePhone] = useState("");
    const [officeHours, setOfficeHours] = useState("");
    const [researchLaboratory, setResearchLaboratory] = useState("");
    const [administrativeContactName, setAdministrativeContactName] =
        useState("");
    const [administrativeContactEmail, setAdministrativeContactEmail] =
        useState("");

    const getString = (value: unknown) =>
        value === null || value === undefined ? "" : String(value);

    useEffect(() => {
        const token = AuthService.getToken();

        if (!token) {
            router.push("/admin/login");
            return;
        }

        const loadSettings = async () => {
            setIsLoading(true);
            setErrorMsg(null);

            try {
                const settings = await SiteSettingService.getSiteSettings();

                setExistingSettings(settings);

                setOfficeRoom(getString(settings.office_room));
                setOfficeBuilding(getString(settings.office_building));
                setCampusAddress(getString(settings.campus_address));
                setOfficePhone(getString(settings.office_phone));
                setOfficeHours(getString(settings.office_hours));
                setResearchLaboratory(
                    getString(settings.research_laboratory)
                );
                setAdministrativeContactName(
                    getString(settings.administrative_contact_name)
                );
                setAdministrativeContactEmail(
                    getString(settings.administrative_contact_email)
                );
            } catch (err: unknown) {
                console.error("Failed to load site settings:", err);

                if (err instanceof Error) {
                    setErrorMsg(err.message);
                } else {
                    setErrorMsg("Failed to load site settings.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        try {
            const payload: SiteSettingsMap = {
                ...existingSettings,

                office_room: officeRoom,
                office_building: officeBuilding,
                campus_address: campusAddress,
                office_phone: officePhone,
                office_hours: officeHours,
                research_laboratory: researchLaboratory,
                administrative_contact_name: administrativeContactName,
                administrative_contact_email: administrativeContactEmail,
            };

            const updated =
                await SiteSettingService.updateSiteSettings(payload);

            setExistingSettings({
                ...payload,
                ...updated,
            });

            setSuccessMsg(
                "Office & Contact Information updated successfully!"
            );
        } catch (err: unknown) {
            console.error("Failed to update site settings:", err);

            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg(
                    "Failed to update Office & Contact Information."
                );
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
                    Loading site settings...
                </p>
            </div>
        );
    }

    const inputClass =
        "w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all";

    const labelClass =
        "block text-xs font-semibold text-slate-300 uppercase tracking-wider";

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
                        Site Settings
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Manage office location, contact details, office hours
                        and research laboratory information.
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
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                            >
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>

                            <span>Save Settings</span>
                        </>
                    )}
                </button>
            </div>

            {/* Success */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-between gap-3"
                    >
                        <span>{successMsg}</span>

                        <button
                            onClick={() => setSuccessMsg(null)}
                            className="text-emerald-400 hover:text-emerald-200"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-between gap-3"
                    >
                        <span>{errorMsg}</span>

                        <button
                            onClick={() => setErrorMsg(null)}
                            className="text-red-400 hover:text-red-200"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-7 shadow-xl"
                >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-4 h-4"
                            >
                                <path d="M3 21h18" />
                                <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                                <path d="M9 9h6" />
                                <path d="M9 13h6" />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-100">
                                Office & Contact Information
                            </h2>

                            <p className="text-xs text-slate-400">
                                These details will appear on the public website.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Office Room */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>
                                Office Room / Floor
                            </label>

                            <input
                                type="text"
                                value={officeRoom}
                                onChange={(e) => setOfficeRoom(e.target.value)}
                                placeholder="Room 408, 4th Floor"
                                className={inputClass}
                            />
                        </div>

                        {/* Building */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>
                                Office Building
                            </label>

                            <input
                                type="text"
                                value={officeBuilding}
                                onChange={(e) =>
                                    setOfficeBuilding(e.target.value)
                                }
                                placeholder="Directorate of IT"
                                className={inputClass}
                            />
                        </div>

                        {/* Campus Address */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className={labelClass}>
                                Campus Address
                            </label>

                            <input
                                type="text"
                                value={campusAddress}
                                onChange={(e) =>
                                    setCampusAddress(e.target.value)
                                }
                                placeholder="University campus address"
                                className={inputClass}
                            />
                        </div>

                        {/* Telephone */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>
                                Office Telephone
                            </label>

                            <input
                                type="text"
                                value={officePhone}
                                onChange={(e) => setOfficePhone(e.target.value)}
                                placeholder="+92 ..."
                                className={inputClass}
                            />
                        </div>

                        {/* Laboratory */}
                        <div className="space-y-1.5">
                            <label className={labelClass}>
                                Research Laboratory
                            </label>

                            <input
                                type="text"
                                value={researchLaboratory}
                                onChange={(e) =>
                                    setResearchLaboratory(e.target.value)
                                }
                                placeholder="Research laboratory / lab location"
                                className={inputClass}
                            />
                        </div>

                        {/* Office Hours */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className={labelClass}>
                                Office Hours
                            </label>

                            <textarea
                                rows={3}
                                value={officeHours}
                                onChange={(e) => setOfficeHours(e.target.value)}
                                placeholder="Monday-Friday: 9:00 AM - 4:00 PM"
                                className={`${inputClass} leading-relaxed resize-y`}
                            />

                            <p className="text-[11px] text-slate-500">
                                Example: Monday-Friday: 9:00 AM - 4:00 PM
                            </p>
                        </div>
                    </div>

                    {/* Administrative Contact */}
                    <div className="pt-6 border-t border-slate-800/80">
                        <h3 className="text-sm font-bold text-slate-200 mb-4">
                            Administrative Contact
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className={labelClass}>
                                    Contact Name
                                </label>

                                <input
                                    type="text"
                                    value={administrativeContactName}
                                    onChange={(e) =>
                                        setAdministrativeContactName(e.target.value)
                                    }
                                    placeholder="Administrative contact name"
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>
                                    Contact Email
                                </label>

                                <input
                                    type="email"
                                    value={administrativeContactEmail}
                                    onChange={(e) =>
                                        setAdministrativeContactEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="contact@university.edu"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Save */}
                    <div className="flex justify-end pt-5 border-t border-slate-800/80">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving && (
                                <Spinner size="sm" variant="primary" />
                            )}

                            {isSaving
                                ? "Saving Settings..."
                                : "Save Office Information"}
                        </button>
                    </div>
                </motion.div>
            </form>
        </div>
    );
}
