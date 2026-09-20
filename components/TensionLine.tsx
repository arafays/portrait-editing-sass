export function TensionLine() {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <div className="relative h-px flex-1 overflow-hidden bg-line">
        <div className="animate-tension-vibrate absolute inset-y-0 left-0 h-full w-full origin-center bg-accent" />
        <div className="animate-tension-sweep absolute inset-y-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-accent-strong to-transparent" />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
        Generating
      </span>
    </div>
  );
}
