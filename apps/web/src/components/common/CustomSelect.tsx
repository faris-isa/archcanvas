import React, { useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | Option)[];
  label?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  const selectedOption =
    normalizedOptions.find((opt) => opt.value === value) || normalizedOptions[0];

  return (
    <div className={`relative flex flex-col gap-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[9px] uppercase text-[var(--color-text-secondary)] font-bold">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-2 py-1.5 text-[11px] text-[var(--color-text-primary)] transition-all hover:border-tech-accent/50 ${
          isOpen ? "border-tech-accent ring-1 ring-tech-accent/20" : ""
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--color-text-secondary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {normalizedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-[11px] transition-colors hover:bg-tech-accent/10 ${
                  opt.value === value
                    ? "text-tech-accent bg-tech-accent/5"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
