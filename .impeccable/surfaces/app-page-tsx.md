---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/HairStudio.tsx","app/login/page.tsx"]
---

## Scope

Whole-app visual direction (mode: Operate). Primary surfaces: the studio (`app/page.tsx` + `components/HairStudio.tsx`) and the login gate (`app/login/page.tsx`), which must share this same world.

Audience: someone deciding on a new haircut/color who wants to see it on their own face first (salon/barber-consultation adjacent), or a curious individual — see PRODUCT.md. Job: upload a portrait, adjust five fixed hair parameters, generate, compare to the original. Proof/content: the user's own uploaded photo is the only content; no fabricated testimonials or sample results exist.

Constraints: five parameters only, each a fixed enum from `lib/hairOptions.ts` (no free text); stateless (no history/gallery); a real generation takes 10–30s; login is a single shared password, no accounts.

## Direction contract

**THESIS:** The product is a professional swatch catalog, not a generic AI form — the category default (an upload box stacked over plain dropdowns) is refused in favor of five physical-feeling chip decks the visitor flips through, echoing the salon consultation this tool replaces.

**OWN-WORLD:** Deep charcoal "catalog case" ground; warm bone/off-white chip cards as the dominant material; one confident saturated accent (a precise copper/amber) reserved for the active chip and the primary action only; small mono chip codes (e.g. "04 — MEDIUM") beside a humanist sans for all other type; hairline dividers and flat chip edges — no soft glows, no gradients, no glassmorphism.

**STORY:** The visitor uploads a portrait and sees their own face locked in place immediately; flips through five swatch decks (density, length, texture, color, hairline) to compose a look; presses one clear primary action; watches a taut loading line; lands on an unmistakable before/after reveal of their own face with new hair.

**FIRST VIEWPORT:** Portrait column (dominant, roughly 55-60% width on desktop): the uploaded photo large and steady, or an inviting dropzone before upload — this is the trust anchor and never shrinks below prominence. Control column: a step rail (UPLOAD → CONSULT → GENERATE → REVEAL) at the top, the five swatch-chip decks stacked below it each collapsed to its current chip with a visible "flip" affordance, and the primary Generate action pinned at the column's base. Stacks to a single column on mobile, portrait first.

**FORM:** The Swatch Deck — assigned index 5 of 7 grounded directions drawn from the salon/photo-editing material world (swatch rings, biometric verification, contact sheets, precision instruments, barber signage, film strips), seed key `15e84a1a`, mode `operate`. Raised past three declined catalog challengers: a visible, arrow-driven step rail (donated by the airport-wayfinding challenger), tactile press/lift feedback when a chip is selected (donated by the CD-ROM chrome-console challenger), and a taut tension-line loading state that relaxes into the reveal (donated by the tensegrity-column challenger). The login screen inherits this same world at reduced density: catalog-case ground, one chip-like input, the same accent on its single action.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
