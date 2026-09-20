const STEPS = ["Upload", "Consult", "Generate", "Reveal"] as const;

export function StepRail({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em]">
      {STEPS.map((step, index) => {
        const isCurrent = index === current;
        const isDone = index < current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={
                isCurrent
                  ? "text-accent-strong"
                  : isDone
                    ? "text-foreground-muted"
                    : "text-foreground-muted/50"
              }
            >
              {String(index + 1).padStart(2, "0")} {step}
            </span>
            {index < STEPS.length - 1 && (
              <span className="text-foreground-muted/40" aria-hidden="true">
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
