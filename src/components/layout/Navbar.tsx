import React from "react";
import { NavItem } from "./NavItem";

export interface NavigationItem {
  label: string;
  href: string;
}

export const DEFAULT_NAV_ITEMS: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "Teaching", href: "/teaching" },
  { label: "Students", href: "/students" },
  { label: "Awards", href: "/awards" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Videos", href: "/videos" },
  { label: "Course Resources", href: "/documents" },
  { label: "Contact", href: "/contact" },
];

export interface NavbarProps {
  items?: NavigationItem[];
  activeHref?: string;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  items = DEFAULT_NAV_ITEMS,
  activeHref = "/",
  className = "",
}) => {
  return (
    <nav
      aria-label="Main Navigation"
      className={`hidden lg:flex items-center gap-0.5 xl:gap-1.5 ${className}`}
    >
      {items.map((item) => (
        <NavItem
          key={item.label}
          label={item.label}
          href={item.href}
          isActive={activeHref === item.href}
        />
      ))}
    </nav>
  );
};
