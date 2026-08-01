import React from "react";
import { Badge } from "./badge";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  titleTag?: "h1" | "h2" | "h3";
}

const alignClasses = {
  left: "text-left items-start",
  center: "text-center items-center mx-auto",
  right: "text-right items-end ml-auto",
};

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = "center",
  titleTag: TitleTag = "h2",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`flex flex-col max-w-3xl mb-12 sm:mb-16 ${alignClasses[align]} ${className}`}
      {...props}
    >
      {eyebrow && (
        <Badge variant="primary" size="md" className="mb-3 uppercase tracking-wider font-semibold">
          {eyebrow}
        </Badge>
      )}

      <TitleTag className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
        {title}
      </TitleTag>

      {description && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
          {description}
        </p>
      )}
    </div>
  );
};
