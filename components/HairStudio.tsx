"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { DEFAULT_HAIR_PARAMS, HAIR_FIELDS, HairParams } from "@/lib/hairOptions";
import { resizeImageForUpload } from "@/lib/resizeImage";
import { StepRail } from "@/components/StepRail";
import { SwatchDeck } from "@/components/SwatchDeck";
import { TensionLine } from "@/components/TensionLine";

type Status = "idle" | "generating" | "done" | "error";

interface GenerateResponse {
  resultUrl: string;
  width?: number;
  height?: number;
}

export function HairStudio() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [params, setParams] = useState<HairParams>(DEFAULT_HAIR_PARAMS);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const step = useMemo(() => {
    if (status === "done") return 3;
    if (status === "generating") return 2;
    if (photoFile) return 1;
    return 0;
  }, [status, photoFile]);

  const selectPhoto = useCallback(
    (file: File | undefined | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus("idle");
      setResult(null);
      setErrorMessage(null);
    },
    [previewUrl]
  );

  const updateParam = useCallback(<K extends keyof HairParams>(key: K, value: HairParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setStatus((prev) => (prev === "done" ? "idle" : prev));
    setResult(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!photoFile) {
      setErrorMessage("Upload a portrait photo first.");
      setStatus("error");
      return;
    }

    setStatus("generating");
    setErrorMessage(null);

    try {
      const resized = await resizeImageForUpload(photoFile);

      const formData = new FormData();
      formData.append("photo", resized, "portrait.jpg");
      for (const field of HAIR_FIELDS) {
        formData.append(field.key, params[field.key]);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed. Please try again.");
      }

      setResult(payload as GenerateResponse);
      setStatus("done");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Generation failed. Please try again.");
      setStatus("error");
    }
  }, [photoFile, params]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <StepRail current={step} />

      <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Portrait column — the trust anchor */}
        <section className="order-1 flex flex-col gap-4">
          {!previewUrl ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingOver(false);
                selectPhoto(event.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              className={[
                "flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-8 text-center transition-colors",
                isDraggingOver
                  ? "border-accent-strong bg-background-raised"
                  : "border-line bg-background-raised/60 hover:border-foreground-muted",
              ].join(" ")}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
                01 — Upload
              </span>
              <p className="max-w-xs text-balance text-lg text-foreground">
                Drop a portrait here, or click to browse
              </p>
              <p className="text-sm text-foreground-muted">
                A close, front-facing headshot works best — face lock weakens
                on wide or full-body shots.
              </p>
            </div>
          ) : status === "done" && result ? (
            <div className="grid animate-reveal-settle grid-cols-2 gap-3">
              <figure className="flex flex-col gap-2">
                <figcaption className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
                  Before
                </figcaption>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Original portrait"
                  className="aspect-[4/5] w-full rounded-md border border-line object-cover"
                />
              </figure>
              <figure className="flex flex-col gap-2">
                <figcaption className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-strong">
                  After
                </figcaption>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-accent-strong">
                  <Image
                    src={result.resultUrl}
                    alt="Portrait with new hairstyle applied"
                    fill
                    sizes="(min-width: 1024px) 30vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <a
                  href={result.resultUrl}
                  download="swatch-result.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[3px] border border-line px-3 py-1.5 text-center text-sm text-foreground-muted transition-colors hover:border-foreground-muted hover:text-foreground"
                >
                  Download result
                </a>
              </figure>
            </div>
          ) : (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded portrait"
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-[3px] border border-line bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-3 w-3 fill-accent-strong"
                >
                  <path d="M8 1a3 3 0 0 0-3 3v2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3Zm0 1.5A1.5 1.5 0 0 1 9.5 4v2h-3V4A1.5 1.5 0 0 1 8 2.5Z" />
                </svg>
                Face locked
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 rounded-[3px] border border-line bg-background/80 px-2 py-1 text-xs text-foreground-muted backdrop-blur-sm transition-colors hover:border-foreground-muted hover:text-foreground"
              >
                Change photo
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => selectPhoto(event.target.files?.[0])}
          />
        </section>

        {/* Control column */}
        <section className="order-2 flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
            02 — Consult
          </p>
          {HAIR_FIELDS.map((field, i) => (
            <SwatchDeck
              key={field.key}
              index={i + 1}
              label={field.label}
              options={field.options}
              value={params[field.key]}
              onChange={(value) => updateParam(field.key, value as never)}
              disabled={status === "generating"}
            />
          ))}

          {errorMessage && (
            <p
              role="alert"
              className="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm text-foreground"
            >
              {errorMessage}
            </p>
          )}

          {status === "generating" && <TensionLine />}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "generating" || !photoFile}
            className="mt-2 rounded-md bg-accent px-4 py-3 font-mono text-sm uppercase tracking-[0.14em] text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "generating" ? "Generating…" : "Generate"}
          </button>
        </section>
      </div>
    </div>
  );
}
