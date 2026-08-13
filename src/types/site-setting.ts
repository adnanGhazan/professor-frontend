export interface SiteSettingsMap {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  contact_email?: string;
  contact_phone?: string;
  office_address?: string;
  office_room?: string;
  office_building?: string;
  campus_address?: string;
  office_telephone?: string;
  office_hours?: string;
  research_laboratory?: string;
  admin_contact_name?: string;
  admin_contact_email?: string;
  footer_text?: string;
  copyright_text?: string;
  default_seo_title?: string;
  default_seo_description?: string;
  youtube_channel_url?: string;
  google_scholar_url?: string;
  researchgate_url?: string;
  orcid_url?: string;
  linkedin_url?: string;
  [key: string]: string | undefined;
}
