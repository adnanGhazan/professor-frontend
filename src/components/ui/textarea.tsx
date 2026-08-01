import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = true,
      className = "",
      id,
      rows = 4,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const widthClass = fullWidth ? "w-full" : "";
    const errorBorder = error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-slate-300 dark:border-slate-700 focus:ring-blue-900 focus:border-blue-900 dark:focus:ring-blue-500 dark:focus:border-blue-500";

    return (
      <div className={`flex flex-col space-y-1.5 ${widthClass}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={`p-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 ${errorBorder} ${widthClass} ${className}`}
          {...props}
        />

        {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
