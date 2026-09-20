# Test 1 — wide, half-body photo

## Input

- `original.jpg` — half-body shot, face occupies roughly 8–10% of the frame, used at its original framing (no crop, no resize applied before upload).

## Hair parameters

| Field | Value |
| --- | --- |
| density | medium |
| length | short |
| texture | wavy |
| color | brown |
| hairline | straight |

## Pipeline

- Endpoint: `fal-ai/flux-general/image-to-image`, called directly via the fal-ai MCP (bypasses the app's UI/route — same model call the app makes).
- Face lock: IP-Adapter `InstantX/FLUX.1-dev-IP-Adapter`, weight `ip-adapter.bin`, encoder `google/siglip-so400m-patch14-384`, `scale: 0.85`.
- `strength: 0.6` (img2img).

## Result

`result.png` — identity drifted: jawline, face shape and beard shape all changed; background and blazer pattern were also regenerated.

## Observation

The face signal fed to the IP-Adapter was too small relative to the frame to hold identity. See Test 2 for the same settings on a tighter crop of the same photo.
