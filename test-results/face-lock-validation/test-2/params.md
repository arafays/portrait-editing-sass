# Test 2 — head-and-shoulders crop

## Input

- `original.jpg` — same photo as Test 1, cropped to head-and-shoulders and resized to match the app's own upload pipeline (`lib/resizeImage.ts`: max 1568px long edge, JPEG q0.85). Framing was the only variable changed from Test 1.

## Hair parameters

Identical to Test 1:

| Field | Value |
| --- | --- |
| density | medium |
| length | short |
| texture | wavy |
| color | brown |
| hairline | straight |

## Pipeline

Identical to Test 1 — same endpoint, same IP-Adapter config, same `scale: 0.85` / `strength: 0.6`. Only the input photo's framing changed.

## Result

`result.png` — identity locked: jawline, beard, nose, eyebrows and head pose all held, while hair changed correctly to the requested short, wavy, brown style. Background and clothing still shifted, which is expected for `image-to-image` at this strength.

## Observation

Confirms framing (how much of the frame the face occupies), not `scale`/`strength`, is what controls identity-lock quality here.
