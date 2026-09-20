# Swatch — Portrait Hair Studio

A private, password-gated demo: upload a portrait, choose density, length, texture, color and hairline, and generate a photorealistic preview of the new hairstyle on your own, unchanged face. Built with Next.js (App Router), Tailwind CSS v4, and fal.ai (Flux dev + IP-Adapter face-lock via `fal-ai/flux-general/image-to-image`).

Stateless by design — nothing is persisted server-side; each generation is a single request/response.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
| --- | --- |
| `FAL_KEY` | Your fal.ai API key ([fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)). Server-only — never expose it to the client. |
| `APP_PASSWORD` | The single shared password that gates the whole app. |
| `SESSION_SECRET` | Any long random string, used to sign the session cookie. |

The same three variables must be set in the Vercel project's environment settings for the deployed app to work.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login` until you enter `APP_PASSWORD`.

## How it works

1. `components/HairStudio.tsx` resizes the uploaded photo client-side (max ~1568px, JPEG) and POSTs it with the 5 chosen parameters to `/api/generate`.
2. `app/api/generate/route.ts` validates the parameters against the fixed enums in `lib/hairOptions.ts`, uploads the photo to fal's storage, builds a prompt from the parameters (`lib/buildPrompt.ts`), and calls `fal-ai/flux-general/image-to-image` with an IP-Adapter (`lib/ipAdapterConfig.ts`) for face lock.
3. The result URL is returned to the client and shown as a before/after reveal, with a download link.

`proxy.ts` (Next's renamed `middleware.ts`) gates every route except `/login` and `/api/login` behind a signed session cookie set by `/api/login`.

## Deploying

Connect the GitHub repo to Vercel and set the three environment variables above in the Vercel project settings — no other configuration is required.
