import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "ghost";
  hover?: boolean;
}

const variantStyles: Record<string, string> = {
  default:
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm",
  bordered:
    "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800",
  elevated:
    "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg dark:shadow-slate-950/50",
  ghost:
    "bg-slate-50/50 dark:bg-slate-900/50 border border-transparent",
};

export const Card: React.FC<CardProps> = ({
  variant = "default",
  hover = false,
  children,
  className = "",
  ...props
}) => {
  const hoverClass = hover
    ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
    : "";

  return (
    <div
      className={`rounded-xl overflow-hidden ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-6 pb-3 flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <h3
      className={`text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <p
      className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-6 pt-0 text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
