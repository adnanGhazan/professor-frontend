import { Metadata } from "next";
import { ProfileService } from "@/src/services/profile.service";
import { SiteSettingService } from "@/src/services/site-setting.service";
import { SocialLinkService } from "@/src/services/social-link.service";
import { SITE_METADATA } from "@/src/constants/site";
import { Section } from "@/src/components/ui/section";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  let title = `Contact | ${SITE_METADATA.name}`;
  let description: string = SITE_METADATA.description;

  try {
    const settings = await SiteSettingService.getSiteSettings();
    if (settings?.default_seo_title) {
      title = `Contact | ${settings.default_seo_title}`;
    }
    if (settings?.default_seo_description) {
      description = settings.default_seo_description;
    }
  } catch (error) {
    // Fallback
  }

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ContactPage() {
  let profile = null;
  let settings = null;
  let socialLinks: any[] = [];

  try {
    const [profileRes, settingsRes, socialLinksRes] = await Promise.allSettled([
      ProfileService.getProfile(),
      SiteSettingService.getSiteSettings(),
      SocialLinkService.getPublicSocialLinks(),
    ]);

    if (profileRes.status === "fulfilled") {
      profile = profileRes.value;
    }
    if (settingsRes.status === "fulfilled") {
      settings = settingsRes.value;
    }
    if (socialLinksRes.status === "fulfilled" && Array.isArray(socialLinksRes.value)) {
      socialLinks = socialLinksRes.value;
    }
  } catch (error) {
    console.error("Failed to load contact information:", error);
  }

  const email = profile?.email || settings?.contact_email || "";
  const department = profile?.department || "";
  const university = profile?.university || "";

  const officeRoom = settings?.office_room || "";
  const officeBuilding = settings?.office_building || "";
  const campusAddress = settings?.campus_address || settings?.office_address || profile?.address || "";
  const officePhone = settings?.office_phone || settings?.office_telephone || settings?.contact_phone || profile?.phone || "";
  const officeHours = settings?.office_hours || "";
  const researchLab = settings?.research_laboratory || "";
  const adminName = settings?.administrative_contact_name || settings?.admin_contact_name || "";
  const adminEmail = settings?.administrative_contact_email || settings?.admin_contact_email || "";

  const hasAnyInfo = Boolean(
    email ||
      department ||
      university ||
      officeRoom ||
      officeBuilding ||
      campusAddress ||
      officePhone ||
      officeHours ||
      researchLab ||
      adminName ||
      adminEmail ||
      (socialLinks && socialLinks.length > 0)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Section variant="default" padding="lg" className="pt-12 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="Get in Touch"
            title="Contact Us"
            description="Have a question, proposal, or inquiry? Reach out to us using the contact details or form below."
            align="center"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info Sidebar */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-100 mb-8 font-sans">
                Contact Information
              </h3>

              <div className="space-y-8 text-slate-300">
                {email && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Email</p>
                      <a href={`mailto:${email}`} className="text-slate-100 hover:text-blue-400 transition-colors text-lg font-medium">
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {(department || university) && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Department & University</p>
                      <p className="text-slate-100 text-lg font-medium">
                        {[department, university].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {(officeRoom || officeBuilding) && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Office Location</p>
                      <p className="text-slate-100 text-lg font-medium">
                        {[officeRoom ? `Room ${officeRoom}` : "", officeBuilding].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {campusAddress && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Campus Address</p>
                      <p className="text-slate-100 whitespace-pre-wrap text-lg font-medium">
                        {campusAddress}
                      </p>
                    </div>
                  </div>
                )}

                {officePhone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Office Phone</p>
                      <a href={`tel:${officePhone}`} className="text-slate-100 hover:text-emerald-400 transition-colors text-lg font-medium">
                        {officePhone}
                      </a>
                    </div>
                  </div>
                )}

                {officeHours && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Office Hours</p>
                      <p className="text-slate-100 text-lg font-medium whitespace-pre-wrap">
                        {officeHours}
                      </p>
                    </div>
                  </div>
                )}

                {researchLab && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.022.547l-1.168 1.168A2 2 0 003.55 19.88l1.168-1.168a2 2 0 011.414-.586h11.736a2 2 0 011.414.586l1.168 1.168a2 2 0 00.138-3.047l-1.168-1.168z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Research Laboratory</p>
                      <p className="text-slate-100 text-lg font-medium">
                        {researchLab}
                      </p>
                    </div>
                  </div>
                )}

                {(adminName || adminEmail) && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Administrative Contact</p>
                      {adminName && (
                        <p className="text-slate-100 text-lg font-medium">
                          {adminName}
                        </p>
                      )}
                      {adminEmail && (
                        <a href={`mailto:${adminEmail}`} className="text-slate-100 hover:text-teal-400 transition-colors text-base font-medium block">
                          {adminEmail}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {socialLinks.length > 0 && (
                  <div className="flex items-start gap-4 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-2 tracking-wide uppercase">Social & Professional Links</p>
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link) => (
                          <a
                            key={link.id || link.platform || link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                          >
                            <span>{link.title || link.platform}</span>
                            <span className="text-[10px] text-slate-400">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!hasAnyInfo && (
                  <p className="text-sm text-slate-500 italic p-4 bg-slate-900 rounded-xl border border-slate-800">
                    Contact information is currently unavailable. Please check back later.
                  </p>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

