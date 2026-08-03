import React from "react";
import { Header, HeaderProps } from "./Header";
import { Footer, FooterProps } from "./Footer";

export interface PageLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  headerProps?: HeaderProps;
  footerProps?: FooterProps;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  activeHref,
  headerProps,
  footerProps,
  className = "",
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Header activeHref={activeHref} {...headerProps} />
      <main className={`flex-1 w-full ${className}`}>{children}</main>
      <Footer {...footerProps} />
    </div>
  );
};
