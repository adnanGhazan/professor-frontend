import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "outline";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700",
  primary: "bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 dark:border-blue-900",
  secondary: "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100 border-slate-300 dark:border-slate-600",
  accent: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-200 dark:border-amber-900",
  success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-200 dark:border-amber-900",
  danger: "bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200 border-red-200 dark:border-red-900",
  outline: "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs gap-1 font-medium",
  md: "px-2.5 py-1 text-xs gap-1.5 font-semibold",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "sm",
  icon,
  children,
  className = "",
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
