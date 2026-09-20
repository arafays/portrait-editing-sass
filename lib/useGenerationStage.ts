"use client";

import { useEffect, useState } from "react";
import { HairParams } from "@/lib/hairOptions";

interface Stage {
  after: number;
  label: (params: HairParams) => string;
}

const STAGES: Stage[] = [
  { after: 0, label: () => "Uploading your portrait" },
  { after: 4, label: () => "Locking your face" },
  { after: 15, label: (p) => `Draping ${p.color} ${p.texture} hair` },
  { after: 45, label: (p) => `Shaping the ${p.hairline} hairline` },
  { after: 75, label: () => "Rendering the final frame" },
  { after: 100, label: () => "Still rendering — complex looks take a little longer" },
];

export function useGenerationStage(active: boolean, params: HairParams) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => setElapsedMs(Date.now() - start);
    const immediate = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 500);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(id);
    };
  }, [active]);

  const seconds = active ? Math.floor(elapsedMs / 1000) : 0;
  const stage = STAGES.reduce((acc, candidate) => (seconds >= candidate.after ? candidate : acc), STAGES[0]);

  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;

  return {
    label: stage.label(params),
    elapsedLabel: `${minutes}:${String(remainderSeconds).padStart(2, "0")}`,
  };
}
