import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   "primary" | "secondary" | "danger" | "ghost";
  size?:      "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?:  boolean;
  leftIcon?:  React.ReactNode;
}

const VARIANTS = {
  primary:
    "text-white font-semibold bg-gradient-to-r from-brand-500 to-violet-600 " +
    "shadow-[0_4px_20px_rgba(79,124,255,0.35)] " +
    "hover:shadow-[0_8px_32px_rgba(79,124,255,0.55)] hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "font-medium bg-[var(--elevated)] border border-[var(--border)] text-[var(--text)] " +
    "hover:bg-[var(--hover-bg)] hover:border-[var(--border-h)] hover:-translate-y-0.5",
  danger:
    "font-semibold text-white bg-red-500 hover:bg-red-600 hover:-translate-y-0.5",
  ghost:
    "font-medium bg-transparent border border-[var(--border)] text-[var(--text)] " +
    "hover:bg-[var(--surface)] hover:border-[var(--border-h)] hover:-translate-y-0.5",
};

const SIZES = {
  sm: "text-xs px-3.5 py-2 rounded-lg",
  md: "text-sm px-5 py-2.5 rounded-xl",
  lg: "text-sm px-7 py-3.5 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, fullWidth = false,
     leftIcon, className = "", disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={[
        "inline-flex items-center justify-center gap-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-1",
        "focus:ring-offset-[var(--bg)]",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant], SIZES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  )
);

Button.displayName = "Button";
