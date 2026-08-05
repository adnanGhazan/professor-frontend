import React from "react";
import { NavItem } from "./NavItem";

export interface NavigationItem {
  label: string;
  href: string;
}

export const DEFAULT_NAV_ITEMS: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Research", href: "#research" },
  { label: "Publications", href: "#publications" },
  { label: "Teaching", href: "#teaching" },
  { label: "Students", href: "#students" },
  { label: "Awards", href: "#awards" },
  { label: "News", href: "#news" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
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
      className={`hidden lg:flex items-center gap-1 xl:gap-2 ${className}`}
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
