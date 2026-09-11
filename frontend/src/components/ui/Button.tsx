import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center h-12 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] focus:ring-[var(--color-primary)]",
    secondary: "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-primary)] focus:ring-[var(--color-secondary)]",
    outline: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-blue-50 focus:ring-[var(--color-primary)] bg-white",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
