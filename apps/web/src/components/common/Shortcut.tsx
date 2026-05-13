import React from "react";

interface ShortcutProps {
  keys: string[];
  className?: string;
}

export const Shortcut: React.FC<ShortcutProps> = ({ keys, className = "" }) => {
  const isMac =
    typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <span className={`inline-flex items-center gap-0.5 ml-2 ${className}`}>
      {keys.map((key, i) => {
        let displayKey = key;
        if (key.toLowerCase() === "ctrl") displayKey = isMac ? "⌘" : "Ctrl";
        if (key.toLowerCase() === "shift") displayKey = isMac ? "⇧" : "Shift";
        if (key.toLowerCase() === "alt") displayKey = isMac ? "⌥" : "Alt";
        if (key.toLowerCase() === "enter") displayKey = "↵";

        return (
          <React.Fragment key={i}>
            <kbd className="min-w-[1.25em] px-1 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 text-[10px] font-mono leading-none flex items-center justify-center shadow-sm">
              {displayKey}
            </kbd>
            {i < keys.length - 1 && <span className="text-[10px] opacity-30">+</span>}
          </React.Fragment>
        );
      })}
    </span>
  );
};
