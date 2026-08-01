import React from "react";
import { Container, ContainerProps } from "./container";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "surface" | "muted" | "primary-subtle" | "dark";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  containerSize?: ContainerProps["size"];
}

const variantClasses = {
  default: "bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
  surface: "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-y border-slate-200/60 dark:border-slate-800",
  muted: "bg-slate-100/70 text-slate-900 dark:bg-slate-900/60 dark:text-slate-100",
  "primary-subtle": "bg-blue-50/60 text-slate-900 dark:bg-blue-950/20 dark:text-slate-100 border-y border-blue-100 dark:border-blue-900/30",
  dark: "bg-slate-900 text-slate-100 dark:bg-slate-950",
};

const paddingClasses = {
  none: "py-0",
  sm: "py-8 sm:py-12",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-24",
  xl: "py-24 sm:py-32",
};

export const Section: React.FC<SectionProps> = ({
  variant = "default",
  padding = "lg",
  containerSize = "lg",
  children,
  className = "",
  ...props
}) => {
  return (
    <section
      className={`relative w-full overflow-hidden ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
};
