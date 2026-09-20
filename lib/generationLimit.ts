/**
 * Client-side demo generation cap.
 *
 * The demo is stateless (no server-side persistence), so the 3-generation
 * limit is enforced per browser via localStorage, same mechanism as
 * `lib/generationHistory.ts`. Only successful generations count.
 */

export const MAX_GENERATIONS = 3;

const STORAGE_KEY = "swatch:generation-count:v1";

function readCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function getGenerationCount(): number {
  return readCount();
}

export function getGenerationsRemaining(): number {
  return Math.max(0, MAX_GENERATIONS - readCount());
}

export function isGenerationLimitReached(): boolean {
  return readCount() >= MAX_GENERATIONS;
}

/** Records one successful generation and returns the number still remaining. */
export function recordGeneration(): number {
  const next = readCount() + 1;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Storage unavailable — the cap degrades gracefully to this session only.
  }
  return Math.max(0, MAX_GENERATIONS - next);
}