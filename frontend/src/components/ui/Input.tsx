import { type InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className = "", type, id, ...props }, ref) => {
    const [showPwd, setShowPwd] = useState(false);
    const isPassword = type === "password";
    const inputType  = isPassword ? (showPwd ? "text" : "password") : type;
    const inputId    = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={[
              "w-full rounded-xl text-sm outline-none transition-all duration-150",
              "bg-[var(--elevated)] border text-[var(--text)]",
              "placeholder:text-[var(--text-3)]",
              "focus:ring-2 focus:ring-offset-0",
              error
                ? "border-red-500/60 focus:ring-red-500/20"
                : "border-[var(--border)] focus:border-brand-500/60 focus:ring-brand-500/15",
              leftIcon ? "pl-10" : "pl-4",
              isPassword ? "pr-11" : "pr-4",
              "py-2.5",
              className,
            ].join(" ")}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-3)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
