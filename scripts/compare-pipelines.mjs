// Live A/B comparison of hair-edit pipelines against the current
// IP-Adapter-Flux account setup. Run from repo root with:
//   set -a && source .env.local && set +a
//   node scripts/compare-pipelines.mjs [original.jpg] [prompt]
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";
import { fal } from "@fal-ai/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIG = join(root, process.argv[2] ?? "test-results/face-lock-validation/test-2/original.jpg");
const PROMPT =
  process.argv[3] ??
  "Change only this person's hairstyle: give them medium-length, wavy, dark-brown hair with a straight hairline. Keep the face, facial features, eyes, expression, skin tone, pose, clothing, background, and lighting EXACTLY the same as the original photo. Photorealistic portrait, sharp focus, high detail.";

const outDir = join(root, "test-results/face-lock-validation/alt-pipelines");
mkdirSync(outDir, { recursive: true });

const save = (name, { url, content_type }) => {
  const ext = content_type === "image/png" ? "png" : "jpg";
  const p = join(outDir, name + "." + ext);
  // Best-effort download via fetch; skip on failure (we still have the URL).
  fetch(url)
    .then((r) => r.arrayBuffer())
    .then((b) => writeFileSync(p, Buffer.from(b)))
    .catch(() => console.log("  (could not save locally:", name, ")"));
  return url;
};

const t = (label) => {
  const start = performance.now();
  return () => `${label}: ${((performance.now() - start) / 1000).toFixed(1)}s`;
};

console.log("Source:", ORIG);
console.log("Prompt:", PROMPT, "\n");

const buf = readFileSync(ORIG);
let srcUrl;
try {
  srcUrl = await fal.storage.upload(buf, { contentType: "image/jpeg" });
} catch {
  srcUrl = await fal.storage.upload(buf);
}
console.log("Uploaded source:", srcUrl, "\n");

const results = {};

// ---- 0. Hair segmentation mask (optional upstream for the inpaint path) ----
let maskUrl = null;
try {
  const done = t("hair-seg");
  const seg = await fal.subscribe("fal-ai/imageutils/hair-seg", {
    input: { image_url: srcUrl },
    logs: true,
  });
  console.log("hair-seg output keys:", Object.keys(seg.data ?? {}));
  console.log(done());
  // Common output shapes: { mask_url } or { image: {url} } (alpha matte)
  maskUrl = seg.data?.mask_url ?? seg.data?.mask?.url ?? seg.data?.image?.url ?? null;
  if (maskUrl) save("0-hair-mask", { url: maskUrl, content_type: "image/png" });
  results["hair-seg"] = { maskUrl };
} catch (e) {
  console.log("hair-seg failed:", String(e).replace(/\s+/g, " ").slice(0, 300));
}

// ---- A. Current pipeline: flux-general/img2img + IP-Adapter (face lock config) ----
const IP_ADAPTER = {
  path: "InstantX/FLUX.1-dev-IP-Adapter",
  weight_name: "ip-adapter.bin",
  image_encoder_path: "google/siglip-so400m-patch14-384",
  image_url: srcUrl,
  scale: 0.85,
};
try {
  const done = t("current-flux+ipadapter");
  const r = await fal.subscribe("fal-ai/flux-general/image-to-image", {
    input: {
      prompt: PROMPT,
      negative_prompt:
        "different person, different face, changed facial structure, changed eyes, changed skin tone, deformed, blurry, low quality, watermark, text, disfigured",
      image_url: srcUrl,
      strength: 0.6,
      num_images: 1,
      ip_adapters: [IP_ADAPTER],
      output_format: "png",
    },
    logs: true,
  });
  const img = r.data?.images?.[0];
  results["A-flux-ipadapter"] = { url: save("A-flux-ipadapter", img), w: img.width, h: img.height };
  console.log("A done:", done());
} catch (e) {
  console.log("A failed:", String(e).replace(/\s+/g, " ").slice(0, 300));
}

// ---- B. Nano Banana 2 edit (maskless instruction-based edit) ----
try {
  const done = t("nano-banana-2-edit");
  const r = await fal.subscribe("fal-ai/nano-banana-2/edit", {
    input: { prompt: PROMPT, image_urls: [srcUrl], output_format: "jpeg", resolution: "1K", num_images: 1 },
    logs: true,
  });
  const img = r.data?.images?.[0];
  if (img?.url) {
    results["B-nano-banana-2"] = { url: save("B-nano-banana-2", img), w: img.width, h: img.height };
    console.log("B done:", done());
  }
} catch (e) {
  console.log("B failed:", String(e).replace(/\s+/g, " ").slice(0, 300));
}

// ---- C. Inpainting path (masked hair regen => face pixels untouched) ----
if (maskUrl) {
  try {
    const done = t("flux-lora-inpaint");
    const r = await fal.subscribe("fal-ai/flux-lora/inpainting", {
      input: {
        prompt:
          "Medium-length, wavy, dark-brown hair with a straight hairline, natural and photorealistic, matches the person and the rest of the photo exactly",
        image_url: srcUrl,
        mask_url: maskUrl,
        strength: 0.95,
        num_images: 1,
        output_format: "png",
      },
      logs: true,
    });
    const img = r.data?.images?.[0];
    if (img?.url) {
      results["C-inpaint-masked"] = { url: save("C-inpaint-masked", img), w: img.width, h: img.height };
      console.log("C done:", done());
    }
  } catch (e) {
    console.log("C failed:", String(e).replace(/\s+/g, " ").slice(0, 300));
  }
}

console.log("\n=== SUMMARY ===");
for (const [k, v] of Object.entries(results)) {
  console.log(k.padEnd(22), v.url, v.w ?? "", v.h ?? "");
  if (v.url && !v.url.endsWith(".fal.media")) console.log("  note: non-fal URL", v.url);
}
console.log("\nLocal artifacts saved to:", outDir);