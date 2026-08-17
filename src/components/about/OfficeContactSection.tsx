"use client";

import React, { useEffect, useState } from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { SocialLinkService } from "@/src/services/social-link.service";
import { ProfileService } from "@/src/services/profile.service";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SocialLink } from "@/src/types/social-link";
import { SocialIcon } from "../ui/social-icon";
import { Spinner } from "../ui/spinner";

export interface OfficeInfo {
  building?: string;
  roomNumber?: string;
  department?: string;
  address?: string;
  officeHours?: string[];
  assistantName?: string;
  assistantEmail?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  labLocation?: string;
  googleScholarUrl?: string;
  orcidUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface OfficeContactSectionProps {
  office?: OfficeInfo;
  contact?: ContactInfo;
  className?: string;
}

export const OfficeContactSection: React.FC<OfficeContactSectionProps> = ({
  office,
  contact,
  className = "",
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic state fields connected to Site Settings & Profile
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [building, setBuilding] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [campusAddress, setCampusAddress] = useState<string>("");
  const [officeHours, setOfficeHours] = useState<string[]>([]);
  const [adminContactName, setAdminContactName] = useState<string>("");
  const [adminContactEmail, setAdminContactEmail] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [labLocation, setLabLocation] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.allSettled([
      SocialLinkService.getPublicSocialLinks(),
      ProfileService.getProfile(),
      SiteSettingService.getSiteSettings(),
    ])
      .then(([linksRes, profileRes, settingsRes]) => {
        if (!isMounted) return;

        let settingsData: Record<string, string | undefined> = {};
        if (settingsRes.status === "fulfilled" && settingsRes.value) {
          settingsData = settingsRes.value as Record<string, string | undefined>;
        }

        let profileData: any = null;
        if (profileRes.status === "fulfilled" && profileRes.value) {
          profileData = profileRes.value;
        }

        // 1. Room Number
        const fetchedRoom = settingsData.office_room || office?.roomNumber || "";
        setRoomNumber(fetchedRoom);

        // 2. Building
        const fetchedBuilding = settingsData.office_building || office?.building || "";
        setBuilding(fetchedBuilding);

        // 3. Department
        const fetchedDepartment = profileData?.department || office?.department || "";
        setDepartment(fetchedDepartment);

        // 4. Campus Address
        const fetchedAddress =
          settingsData.campus_address ||
          settingsData.office_address ||
          profileData?.office ||
          profileData?.address ||
          office?.address ||
          "";
        setCampusAddress(fetchedAddress);

        // 5. Office Hours
        const rawHours = settingsData.office_hours;
        if (rawHours && typeof rawHours === "string" && rawHours.trim().length > 0) {
          setOfficeHours(rawHours.split("\n").map((h) => h.trim()).filter(Boolean));
        } else if (office?.officeHours && office.officeHours.length > 0) {
          setOfficeHours(office.officeHours);
        } else {
          setOfficeHours([]);
        }

        // 6. Admin Contact
        const fetchedAdminName =
          settingsData.administrative_contact_name ||
          settingsData.admin_contact_name ||
          office?.assistantName ||
          "";
        const fetchedAdminEmail =
          settingsData.administrative_contact_email ||
          settingsData.admin_contact_email ||
          office?.assistantEmail ||
          "";
        setAdminContactName(fetchedAdminName);
        setAdminContactEmail(fetchedAdminEmail);

        // 7. Email
        const fetchedEmail =
          settingsData.contact_email ||
          profileData?.email ||
          contact?.email ||
          "";
        setEmail(fetchedEmail);

        // 8. Telephone Phone
        const fetchedPhone =
          settingsData.office_phone ||
          settingsData.office_telephone ||
          settingsData.contact_phone ||
          profileData?.phone ||
          contact?.phone ||
          "";
        setPhone(fetchedPhone);

        // 9. Research Lab
        const fetchedLab =
          settingsData.research_laboratory ||
          contact?.labLocation ||
          "";
        setLabLocation(fetchedLab);

        // 10. Social Links
        let fetchedLinks: SocialLink[] = [];
        if (linksRes.status === "fulfilled" && Array.isArray(linksRes.value)) {
          fetchedLinks = [...linksRes.value];
        }

        // Add academic/social links from site settings if available and not present
        const settingSocials: { key: string; platform: string; label: string }[] = [
          { key: "google_scholar_url", platform: "googlescholar", label: "Google Scholar" },
          { key: "orcid_url", platform: "orcid", label: "ORCID iD" },
          { key: "researchgate_url", platform: "researchgate", label: "ResearchGate" },
          { key: "youtube_channel_url", platform: "youtube", label: "YouTube Channel" },
          { key: "linkedin_url", platform: "linkedin", label: "LinkedIn" },
        ];

        settingSocials.forEach(({ key, platform, label }) => {
          const url = settingsData[key];
          if (url && typeof url === "string" && url.trim().length > 0) {
            const exists = fetchedLinks.some((l) => l.platform.toLowerCase() === platform.toLowerCase());
            if (!exists) {
              fetchedLinks.push({
                id: `setting-${platform}`,
                platform,
                url: url.trim(),
                label,
                icon: null,
                sort_order: 99,
                is_visible: true,
              });
            }
          }
        });

        setSocialLinks(fetchedLinks);
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load contact information.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contact, office]);

  return (
    <Section variant="surface" padding="lg" id="contact-info" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Campus Presence & Communication"
          title="Office & Contact Information"
          description="Office location, advisory hours, direct contact details, and laboratory location."
          align="center"
        />

        {error && (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Spinner size="lg" variant="primary" />
            <p className="text-xs font-mono text-slate-400 animate-pulse">Loading contact details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Office Information Card */}
            <Card
              variant="default"
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-400">
                      <svg className="w-6 h-6 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                        Office Information
                      </CardTitle>
                      <span className="text-xs font-semibold text-blue-900 dark:text-blue-400">
                        Faculty Location & Hours
                      </span>
                    </div>
                  </div>
                  {roomNumber ? (
                    <Badge variant="primary" size="sm">
                      {roomNumber}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">
                      Faculty Location
                    </Badge>
                  )}
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                      Building & Department
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {building || <span className="text-slate-400 italic">Not provided</span>}
                    </p>
                    {department && (
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{department}</p>
                    )}
                  </div>

                  <div>
                    <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                      Campus Address
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      {campusAddress || <span className="text-slate-400 italic">Not provided</span>}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="block font-bold text-blue-900 dark:text-blue-400 text-xs uppercase tracking-wider">
                      Student Office Hours
                    </span>
                    {officeHours.length > 0 ? (
                      <ul className="space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                        {officeHours.map((hour, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{hour}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic font-mono">Not specified</p>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs uppercase tracking-wider mb-1">
                      Administrative Contact
                    </span>
                    {adminContactName || adminContactEmail ? (
                      <p className="text-slate-600 dark:text-slate-400">
                        {adminContactName} {adminContactEmail ? `(${adminContactEmail})` : ""}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information & Social Profiles Card */}
            <Card
              variant="default"
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                      <svg className="w-6 h-6 fill-none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                        Contact Information
                      </CardTitle>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Direct Communication Channels
                      </span>
                    </div>
                  </div>
                  <Badge variant="accent" size="sm">
                    Official Channels
                  </Badge>
                </div>

                <div className="space-y-5 text-xs sm:text-sm">
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                      Institutional Email
                    </span>
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="font-mono text-blue-900 dark:text-blue-400 font-semibold hover:underline"
                      >
                        {email}
                      </a>
                    ) : (
                      <span className="font-mono text-slate-400 italic">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                      Office Telephone
                    </span>
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="font-mono text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                      >
                        {phone}
                      </a>
                    ) : (
                      <span className="font-mono text-slate-400 italic">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                      Research Laboratory
                    </span>
                    {labLocation ? (
                      <p className="text-slate-600 dark:text-slate-400">{labLocation}</p>
                    ) : (
                      <p className="text-slate-400 italic">Not provided</p>
                    )}
                  </div>

                  {/* Dynamic Academic & Social Profiles */}
                  {socialLinks.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                      <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                        Scholarly & Professional Profiles
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {socialLinks.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label || link.platform}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 font-semibold flex items-center justify-between transition-colors border border-slate-200/50 dark:border-slate-700/50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <SocialIcon platform={link.platform} className="w-4 h-4 shrink-0" />
                              <span className="truncate">{link.label || link.platform}</span>
                            </div>
                            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Section>
  );
};
