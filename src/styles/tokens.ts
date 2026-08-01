/**
 * TypeScript Design Tokens Definition
 */

export const tokens = {
  colors: {
    primary: "var(--color-primary)",
    primaryHover: "var(--color-primary-hover)",
    primaryLight: "var(--color-primary-light)",
    secondary: "var(--color-secondary)",
    accent: "var(--color-accent)",
    background: "var(--color-background)",
    surface: "var(--color-surface)",
    border: "var(--color-border)",
    textPrimary: "var(--color-text-primary)",
    textSecondary: "var(--color-text-secondary)",
    textMuted: "var(--color-text-muted)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  },
  borderRadius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    full: "var(--radius-full)",
  },
  transitions: {
    fast: "var(--duration-fast) var(--ease-in-out)",
    normal: "var(--duration-normal) var(--ease-in-out)",
    slow: "var(--duration-slow) var(--ease-in-out)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;
