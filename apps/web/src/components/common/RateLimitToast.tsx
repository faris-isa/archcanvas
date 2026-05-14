import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface RateLimitToastProps {
  retryAfter?: string; // e.g. "51s" or "51.992810113s"
  onDismiss: () => void;
}

function parseSeconds(retryAfter?: string): number {
  if (!retryAfter) return 60;
  const match = retryAfter.match(/[\d.]+/);
  return match ? Math.ceil(parseFloat(match[0])) : 60;
}

export const RateLimitToast: React.FC<RateLimitToastProps> = ({ retryAfter, onDismiss }) => {
  const [remaining, setRemaining] = useState(() => parseSeconds(retryAfter));

  useEffect(() => {
    if (remaining <= 0) {
      onDismiss();
      return;
    }
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onDismiss]);

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border text-[11px] leading-relaxed"
      style={{
        background: "rgba(239, 68, 68, 0.08)",
        borderColor: "rgba(239, 68, 68, 0.3)",
        color: "var(--color-text-secondary)",
      }}
    >
      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-red-400 mb-1">Gemini rate limit reached</p>
        <p>All available models are temporarily exhausted. Auto-retrying in:</p>
        <div className="flex items-center gap-1.5 mt-2 font-mono text-red-300 font-bold text-base">
          <Clock size={13} />
          {remaining}s
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors text-base leading-none opacity-50 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};
