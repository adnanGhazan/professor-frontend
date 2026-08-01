import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "small" | "normal" | "large";
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1400px]",
  full: "max-w-full",
};

const paddingClasses = {
  none: "px-0",
  small: "px-3 sm:px-4",
  normal: "px-4 sm:px-6 lg:px-8",
  large: "px-6 sm:px-10 lg:px-12",
};

export const Container: React.FC<ContainerProps> = ({
  size = "lg",
  padding = "normal",
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`mx-auto w-full ${sizeClasses[size]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
