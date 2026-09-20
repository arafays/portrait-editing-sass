"use client";

import { toTitleCase } from "@/lib/formatLabel";

interface SwatchDeckProps {
  index: number;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SwatchDeck({
  index,
  label,
  options,
  value,
  onChange,
  disabled,
}: SwatchDeckProps) {
  return (
    <fieldset
      disabled={disabled}
      className="rounded-md border border-line bg-background-raised p-4 disabled:opacity-50"
    >
      <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
        {String(index).padStart(2, "0")} — {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={isActive}
              className={[
                "rounded-[3px] border px-3 py-1.5 text-sm transition-all duration-150 ease-out",
                "active:translate-y-0 active:shadow-none",
                isActive
                  ? "-translate-y-0.5 border-accent-strong bg-accent text-accent-ink shadow-[0_3px_0_0_var(--color-accent-strong)]"
                  : "border-line bg-transparent text-foreground-muted hover:border-foreground-muted hover:text-foreground",
              ].join(" ")}
            >
              {toTitleCase(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
