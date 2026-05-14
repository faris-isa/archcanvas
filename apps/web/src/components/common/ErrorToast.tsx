import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ErrorToastProps {
  title?: string;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  title = "An error occurred",
  message,
  onDismiss,
  autoDismissMs = 8000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border text-[11px] leading-relaxed animate-fade-in"
      style={{
        background: "rgba(239, 68, 68, 0.08)",
        borderColor: "rgba(239, 68, 68, 0.3)",
        color: "var(--color-text-secondary)",
      }}
    >
      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-red-400 mb-1">{title}</p>
        <p>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors text-base leading-none opacity-50 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
};
