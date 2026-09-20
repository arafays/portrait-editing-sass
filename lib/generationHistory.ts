import { HairParams } from "@/lib/hairOptions";

const STORAGE_KEY = "swatch:history:v1";
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  createdAt: number;
  params: HairParams;
  resultUrl: string;
  width?: number;
  height?: number;
  beforeThumb: string;
}

type Listener = () => void;

let snapshot: HistoryEntry[] = [];
let initialized = false;
const listeners = new Set<Listener>();

function readFromStorage(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;
  snapshot = readFromStorage();
}

function persist(entries: HistoryEntry[]): void {
  snapshot = entries;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Quota exceeded — history is a convenience, so drop the oldest half and retry once.
      if (entries.length > 1) {
        const trimmed = entries.slice(0, Math.ceil(entries.length / 2));
        snapshot = trimmed;
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch {
          // Still over quota; leave storage as-is.
        }
      }
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeHistory(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getHistorySnapshot(): HistoryEntry[] {
  ensureInitialized();
  return snapshot;
}

export function getServerHistorySnapshot(): HistoryEntry[] {
  return [];
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): void {
  const withId: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  persist([withId, ...getHistorySnapshot()].slice(0, MAX_ENTRIES));
}

export function clearHistory(): void {
  persist([]);
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
