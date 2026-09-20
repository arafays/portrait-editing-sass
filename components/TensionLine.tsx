interface TensionLineProps {
  label: string;
  elapsedLabel: string;
}

export function TensionLine({ label, elapsedLabel }: TensionLineProps) {
  return (
    <div className="flex items-center gap-3">
      <div aria-hidden="true" className="relative h-px flex-1 overflow-hidden bg-line">
        <div className="animate-tension-vibrate absolute inset-y-0 left-0 h-full w-full origin-center bg-accent" />
        <div className="animate-tension-sweep absolute inset-y-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-accent-strong to-transparent" />
      </div>
      <span
        role="status"
        aria-live="polite"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted"
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="font-mono text-[11px] tabular-nums text-foreground-muted/60"
      >
        {elapsedLabel}
      </span>
    </div>
  );
}
