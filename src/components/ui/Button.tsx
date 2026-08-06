import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-700 disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-6 py-3.5 text-base",
        variant === "primary" &&
          "bg-pine-700 text-white shadow-card hover:bg-pine-800 active:scale-[0.98]",
        variant === "secondary" &&
          "bg-sand-200 text-charcoal-900 hover:bg-sand-100 border border-sand-200",
        variant === "ghost" &&
          "text-charcoal-700 hover:bg-sand-100",
        variant === "danger" &&
          "bg-red-50 text-red-700 hover:bg-red-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
