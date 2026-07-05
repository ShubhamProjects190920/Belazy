import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type:      AlertType;
  message:   string;
  onDismiss?: () => void;
  className?: string;
}

const CONFIGS: Record<AlertType, { icon: React.ReactNode; bg: string; border: string; color: string }> = {
  success: {
    icon:   <CheckCircle2  className="w-4 h-4 shrink-0" />,
    bg:     "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    color:  "#10b981",
  },
  error: {
    icon:   <AlertCircle   className="w-4 h-4 shrink-0" />,
    bg:     "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    color:  "#ef4444",
  },
  warning: {
    icon:   <AlertTriangle className="w-4 h-4 shrink-0" />,
    bg:     "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    color:  "#f59e0b",
  },
  info: {
    icon:   <Info          className="w-4 h-4 shrink-0" />,
    bg:     "rgba(79,124,255,0.1)",
    border: "rgba(79,124,255,0.25)",
    color:  "#4f7cff",
  },
};

export function Alert({ type, message, onDismiss, className = "" }: AlertProps) {
  const { icon, bg, border, color } = CONFIGS[type];
  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${className}`}
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {icon}
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
