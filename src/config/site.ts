import { SITE_METADATA } from "../constants/site";

export const siteConfig = {
  ...SITE_METADATA,
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Dashboard", href: "/dashboard" },
    { title: "Profile", href: "/profile" },
  ],
};
