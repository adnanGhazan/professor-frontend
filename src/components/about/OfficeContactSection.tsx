import React from "react";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export interface OfficeInfo {
  building: string;
  roomNumber: string;
  department: string;
  address: string;
  officeHours: string[];
  assistantName?: string;
  assistantEmail?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  labLocation: string;
  googleScholarUrl: string;
  orcidUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface OfficeContactSectionProps {
  office?: OfficeInfo;
  contact?: ContactInfo;
  className?: string;
}

export const OfficeContactSection: React.FC<OfficeContactSectionProps> = ({
  office = {
    building: "Turing Science & Technology Building",
    roomNumber: "Room 408 (4th Floor)",
    department: "Department of Computer Science & AI Research Center",
    address: "75 Science Drive, University Campus, Building 400",
    officeHours: ["Tuesday: 2:00 PM — 4:00 PM", "Thursday: 10:00 AM — 12:00 PM", "By appointment via email"],
    assistantName: "Ms. Sarah Jenkins (Administrative Coordinator)",
    assistantEmail: "s.jenkins@university.edu",
  },
  contact = {
    email: "alex.morgan@university.edu",
    phone: "+1 (555) 019-2834",
    labLocation: "Autonomous Systems Lab, Turing Building Room 412",
    googleScholarUrl: "https://scholar.google.com",
    orcidUrl: "https://orcid.org",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
  },
  className = "",
}) => {
  return (
    <Section variant="surface" padding="lg" id="contact-info" className={`relative overflow-hidden ${className}`}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Campus Presence & Communication"
          title="Office & Contact Information"
          description="Office location, advisory hours, direct contact details, and laboratory location."
          align="center"
        />

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
                <Badge variant="primary" size="sm">
                  {office.roomNumber}
                </Badge>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                    Building & Department
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{office.building}</p>
                  <p className="text-slate-500 dark:text-slate-400">{office.department}</p>
                </div>

                <div>
                  <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                    Campus Address
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">{office.address}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <span className="block font-bold text-blue-900 dark:text-blue-400 text-xs uppercase tracking-wider">
                    Student Office Hours
                  </span>
                  <ul className="space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {office.officeHours.map((hour, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{hour}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {office.assistantName && (
                  <div className="pt-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                      Administrative Contact:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">
                      {office.assistantName} ({office.assistantEmail})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information Card */}
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
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-mono text-blue-900 dark:text-blue-400 font-semibold hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>

                <div>
                  <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                    Office Telephone
                  </span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-mono text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>

                <div>
                  <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
                    Research Laboratory
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">{contact.labLocation}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                    Scholarly & Professional Profiles
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a
                      href={contact.googleScholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-400 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>Google Scholar</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>

                    <a
                      href={contact.orcidUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-400 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>ORCID iD</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>

                    <a
                      href={contact.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-400 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>GitHub</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>

                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-400 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>LinkedIn</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};
