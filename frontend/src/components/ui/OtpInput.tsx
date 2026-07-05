/**
 * OTP Input Component
 * 6 individual digit boxes — auto-advances to next box, handles paste, backspace.
 */
import { useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import clsx from "clsx";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function focus(index: number) {
    inputs.current[index]?.focus();
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === index ? digit : d));
    onChange(next.join("").replace(/ /g, ""));
    if (digit && index < 5) focus(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = digits.map((d, i) => (i === index ? "" : d));
        onChange(next.join("").replace(/ /g, ""));
      } else if (index > 0) {
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focus(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    focus(Math.min(pasted.length, 5));
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : (digits[i] ?? "")}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={clsx(
            "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white",
            "focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors",
            error
              ? "border-red-400 text-red-600 focus:ring-red-500"
              : digits[i] && digits[i] !== " "
              ? "border-brand-600 text-brand-900"
              : "border-slate-200 text-slate-900"
          )}
        />
      ))}
    </div>
  );
}
