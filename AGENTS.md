<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repo facts

Single-page, password-gated demo ("Swatch") built to pitch a face-preserving hair-editing SaaS: upload a portrait → pick 5 hair params → fal.ai generates a new hairstyle with the face locked. No accounts, no DB, stateless. Product intent and constraints live in `PRODUCT.md` (incl. don't fabricate testimonials/sample imagery). `CLAUDE.md` just points back to this file (`@AGENTS.md`), so keep guidance here.

## Commands

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` — flat ESLint config (`eslint.config.mjs`). There is **no typecheck or test script**; typecheck manually with `npx tsc --noEmit`.

## Auth gates everything except login

- Root `proxy.ts` — in this Next version `middleware.ts` was renamed to `proxy.ts` with an `export function proxy(...)` — redirects to `/login` unless a valid session cookie exists. New public routes must be added to its `matcher` (it currently covers all of `app/api/*` too).
- Login/logout are plain form POSTs to `app/api/login` / `app/api/logout`. The session is an HMAC-signed cookie built in `lib/session.ts` against `APP_PASSWORD`/`SESSION_SECRET`.

## Env

- `.env.local` (gitignored) must set `FAL_KEY`, `APP_PASSWORD`, `SESSION_SECRET`; see `.env.example`. `lib/fal.ts` calls `fal.config()` at module import — it's server-only by construction.

## Claude Code MCP (fal-ai)

- `.mcp.json` (project scope) wires the fal Run MCP server (`https://mcp.fal.ai/mcp`, streamable HTTP) into Claude Code as `fal-ai`. It's safe to commit: the `Authorization` header is `Bearer ${FAL_KEY}` and Claude Code expands the variable at runtime.
- Claude Code reads `FAL_KEY` from the **shell environment**, not from `.env.local` (Next.js-only). Before launching `claude`, do `set -a && source .env.local && set +a` (or export it in your shell profile). If it's unset, the header sends an empty bearer token and the connection fails with 401.
- On first run, approve the project-scoped server with `claude` → /mcp (shows `⏸ Pending approval` in `claude mcp list` until then).
- The fal Run MCP is read-only on your account beyond running inference you ask for; see fal's docs for the optional Platform MCP (`api.fal.ai/v1/mcp/platform`, `Authorization: Key …`) if you want serverless debugging tools too.

## Generation flow (the core)

- `components/HairStudio.tsx` (client) resizes the photo in-browser (`lib/resizeImage.ts`: max 1568px, JPEG q0.85) and POSTs multipart FormData (photo + 5 params) to `/api/generate`.
- `app/api/generate/route.ts` pins `runtime = "nodejs"` (the fal client needs it) — don't switch to edge. It uploads the photo to fal storage, builds the prompt (`lib/buildPrompt.ts`), then `fal.subscribe("fal-ai/flux-general/image-to-image", …)`.
- Face lock = `lib/ipAdapterConfig.ts`: IP-Adapter `InstantX/FLUX.1-dev-IP-Adapter` + siglip encoder, `scale: 0.85`, img2img `strength: 0.6`. **Verified end-to-end** via the fal-ai MCP against a real photo — schema, weight file, and encoder path all match the live API and the HF repo's own inference code. Identity lock quality is dominated by input framing, not `scale`/`strength`: a half-body/wide shot (face <10% of frame) drifted noticeably; a head-and-shoulders crop resized to `resizeImage.ts`'s output locked identity solidly at the same settings. If output drifts in practice, check framing before retuning `scale`/`strength`.
- The 5 hair params are enums; `lib/hairOptions.ts` (`HAIR_FIELDS`) is the single source of truth. Both the UI (`SwatchDeck`) and server validation (`validateHairParams`) iterate `HAIR_FIELDS` — to add or change an option, edit that file only.
- Results load from `**.fal.media` via `next/image`; `next.config.ts` `remotePatterns` already allows that host — keep it or generated images break. In-page previews are `blob:` URLs rendered with raw `<img>` + eslint-disable (`next/image` can't render blob URLs).

## Framework quirks

- Pages/layouts type props via the global helpers `PageProps<'/route'>` / `LayoutProps<'/route'>` (new in this Next version) instead of hand-writing `params`/`searchParams` types.
- Tailwind v4 CSS-first: tokens are CSS vars wired into Tailwind via `@theme inline` in `app/globals.css` (e.g. `accent`, `line`, `background-raised`) — add colors there, not in config.
- Git history is a single create-next-app commit; all app code is currently uncommitted (deliverable is handed to the client's GitHub).