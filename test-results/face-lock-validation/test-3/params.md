# Test 3 — real photo through the production endpoint

## Input

- `original.jpg` — a different subject (a separate real photo, not the Test 1/2 subject), a close head-and-shoulders crop, but only **128×128px** — far smaller than the app's normal max-1568px upload size.

## Hair parameters

Only "Blonde" was picked in the UI; every other field was left at `DEFAULT_HAIR_PARAMS` (`lib/hairOptions.ts`):

| Field | Value | Picked or default? |
| --- | --- | --- |
| density | medium | default |
| length | medium | default |
| texture | straight | default |
| color | blonde | picked |
| hairline | straight | default |

## Pipeline

Run through the **actual deployed app**, not a raw model call: browser → `/login` → upload → click "Blonde" → "Generate" → `app/api/generate/route.ts` → `fal-ai/flux-general/image-to-image` with the same IP-Adapter config as Tests 1–2 (`scale: 0.85`, `strength: 0.6`). This exercises `lib/buildPrompt.ts` and `lib/resizeImage.ts` for real, not a hand-built request.

## Result

`result.png` — 128×128, matching the input's resolution. Beard shape and general face structure resemble the input reasonably well.

## Observation

Identity held up even on a very low-resolution input, which is more evidence that face-to-frame ratio (not resolution or `scale`/`strength`) is the dominant factor. However 128×128 is too small to judge fine detail or to represent real output quality — this input photo was itself a low-res test fixture, not representative of a real client upload. Treat this as a smoke test of the real `/api/generate` path, not a quality benchmark.

## Excluded from this test set

Two other files from the same validation session were **not** used as tests here because they aren't real portraits:
- a generic placeholder/avatar illustration (flat cartoon face) that was mistakenly fetched as a stand-in photo — running it through the pipeline just produced another flat, cartoon-styled image, which would misleadingly read as "the model broke" if included
- a random forest photo and a failed download (an HTML error page saved with a `.jpg` extension)
