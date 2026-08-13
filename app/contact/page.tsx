import { Metadata } from "next";
import { SiteSettingService } from "@/src/services/site-setting.service";
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
  let settings = null;
  try {
    settings = await SiteSettingService.getSiteSettings();
  } catch (error) {
    // Fallback
  }

  const contactEmail = settings?.contact_email || "";
  const contactPhone = settings?.contact_phone || "";
  const officeAddress = settings?.office_address || "";

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
                {contactEmail && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Email</p>
                      <a href={`mailto:${contactEmail}`} className="text-slate-100 hover:text-blue-400 transition-colors text-lg">
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {contactPhone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Phone</p>
                      <a href={`tel:${contactPhone}`} className="text-slate-100 hover:text-emerald-400 transition-colors text-lg">
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {officeAddress && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-1 tracking-wide uppercase">Office Address</p>
                      <p className="text-slate-100 whitespace-pre-wrap text-lg">
                        {officeAddress}
                      </p>
                    </div>
                  </div>
                )}
                
                {!contactEmail && !contactPhone && !officeAddress && (
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
