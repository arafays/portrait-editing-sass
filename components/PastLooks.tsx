"use client";

import Image from "next/image";
import { HistoryEntry, formatRelativeTime } from "@/lib/generationHistory";
import { toTitleCase } from "@/lib/formatLabel";

interface PastLooksProps {
  entries: HistoryEntry[];
  activeId: string | null;
  disabled?: boolean;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function PastLooks({ entries, activeId, disabled, onSelect, onClear }: PastLooksProps) {
  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 border-t border-line pt-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
          Past looks — {entries.length}
        </span>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry)}
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={`View past look — ${toTitleCase(entry.params.color)}, ${toTitleCase(
                entry.params.length
              )}, ${formatRelativeTime(entry.createdAt)}`}
              className="group flex w-16 flex-shrink-0 flex-col gap-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div
                className={[
                  "relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border transition-colors",
                  isActive
                    ? "border-accent-strong"
                    : "border-line group-hover:border-foreground-muted",
                ].join(" ")}
              >
                <Image src={entry.resultUrl} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <span className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
