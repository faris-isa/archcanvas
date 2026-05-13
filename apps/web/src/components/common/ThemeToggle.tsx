import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { Shortcut } from "./Shortcut";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-all flex items-center justify-center"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode (Ctrl + Shift + L)`}
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-industrial-gold group-hover:scale-110 transition-transform"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-tech-accent group-hover:scale-110 transition-transform"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
      <Shortcut
        keys={["Ctrl", "Shift", "L"]}
        className="absolute -bottom-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-bg-secondary)] p-1 rounded border border-[var(--color-border)] pointer-events-none whitespace-nowrap z-50 shadow-xl"
      />
    </button>
  );
};
