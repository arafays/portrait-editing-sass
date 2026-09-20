# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4. Existing codebase (create-next-app scaffold); this was the framework already in place, not a choice made during this init.

## Users

Primary: someone deciding on a new haircut or hair color who wants to see it on their own face before committing — e.g. a salon/barber client browsing options ahead of or during a consultation. Secondary: anyone curious to try a hairstyle change on a personal photo. [Inferred — the client did not specify an end-audience; the user deferred this choice to the design process rather than confirming a real answer.]

## Product Purpose

Lets a person upload a portrait photo and adjust five hair parameters (density, length, texture, color, hairline) to generate a photorealistic edited version of their own photo with the new hairstyle applied, while keeping their face and identity unchanged. Success is a result that reads as unmistakably "still me," just with different hair.

## Positioning

The mechanism a neighboring product could not casually copy: strict face identity lock (IP-Adapter-conditioned Flux generation) rather than a generic style filter — the output is not "a person who kind of looks like you with new hair," it is verifiably your own face. The core visual claim across the product is "your face, untouched."

## Operating Context

- Single-page workflow: upload a portrait → adjust five hair parameters → generate → compare result to original → download.
- This is a private, password-gated demo build (one shared password, no accounts) shown to a prospective client to demonstrate capability; it is not yet a multi-tenant SaaS.
- Stateless: nothing is persisted server-side between sessions; no history or gallery.
- A generation is a real inference call (fal.ai / Flux) and can take on the order of 10–30 seconds.

## Capabilities and Constraints

- Exactly five hair parameters, each a fixed enum (not free text): density (thin/medium/thick), length (buzz cut/short/medium/long/very long), texture (straight/wavy/curly/coily), color (black/dark brown/brown/light brown/blonde/auburn/red/gray/white), hairline (straight/receding/widow's peak/rounded/M-shaped). Source of truth: `lib/hairOptions.ts`.
- One portrait photo per generation; one result image per generation (no batch/variant generation in this scope).
- No user accounts, no saved history, no payment/billing in this build.

## Brand Commitments

No existing name, logo, or brand identity. The user asked for a simple, generic, credible name rather than real brand-identity work — no logo design expected.

## Evidence on Hand

None. No real customer photos, testimonials, or case studies exist; the demo must not fabricate any. Placeholder/sample imagery used in the UI (e.g. an empty-state illustration) must read as a generic placeholder, not a fake testimonial or fake before/after result.

## Product Principles

- The face is the trust anchor: every design decision should reinforce "this is still you," especially in how before/after is presented.
- Five parameters, no more: the tool's clarity comes from a small, fixed set of controls, not from flexibility or free-form prompting exposed to the user.
- Credible over flashy: this is a technical capability pitch to a client, so the UI should read as production-grade software, not a flashy toy.
- Respect real latency: generation is slow (10–30s); the waiting experience must feel intentional, not broken.

## Accessibility & Inclusion

No specific standard was mandated. Given photos of real human faces are the core content, avoid any visual treatment that could read as mocking, distorting, or stereotyping physical appearance.
