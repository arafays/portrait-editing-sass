// Masked hair-edit pipeline test (v2).
// fal hosts NO accessible hair-seg endpoint for this account (imageutils/* 404 at
// runtime), so the hair mask is derived locally from the diff between the current
// pipeline output (A) and the original: the region where A actually changed the
// hair. Clearly a stand-in for a real hair segmenter — saved as 1-hair-mask-diff.png
// for you to judge.
// Proves: (1) inpainting changes ONLY the masked region, (2) everything outside the
// mask is pixel-identical to the original (diff ~0), the literal "face untouched".
// Run: set -a && source .env.local && set +a && node scripts/compare-masked.mjs
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { fal } from "@fal-ai/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIG = join(root, "test-results/face-lock-validation/test-2/original.jpg");
const A_OUT = join(root, "test-results/face-lock-validation/alt-pipelines/A-flux-ipadapter.png");
const outDir = join(root, "test-results/face-lock-validation/alt-pipelines");

if (!existsSync(A_OUT)) throw new Error("A-flux-ipadapter.png missing — run scripts/compare-pipelines.mjs first.");

const HAIR_PROMPT =
  "Medium-length wavy dark-brown hair with a straight hairline, natural photorealistic hair strands with realistic texture, sharp focus, high detail, blends seamlessly with the portrait.";

// --- 1. Local hair mask = region the current pipeline changed the most ---
const loadRgb = async (p, w, h) => (await sharp(p).resize(w, h).removeAlpha().raw().toBuffer({ resolveWithObject: true })).data;

const origRaw = await sharp(ORIG).raw().toBuffer({ resolveWithObject: true });
const W = origRaw.info.width, H = origRaw.info.height;
const orig = origRaw.data;
const aRgb = await loadRgb(A_OUT, W, H);

const diff = Buffer.alloc(W * H);
let maxDiff = 0;
for (let i = 0; i < W * H; i++) {
  const d = (Math.abs(aRgb[i * 3] - orig[i * 3]) + Math.abs(aRgb[i * 3 + 1] - orig[i * 3 + 1]) + Math.abs(aRgb[i * 3 + 2] - orig[i * 3 + 2])) / 3;
  diff[i] = Math.min(255, Math.round(d));
  if (d > maxDiff) maxDiff = d;
}

// Quantiles of the diff to pick an honest threshold
const quantiles = (arr, qs) => {
  const s = Array.from(arr).sort((x, y) => x - y);
  return qs.map((q) => s[Math.min(s.length - 1, Math.floor(q * s.length))]);
};
const [p50, p70, p85, p90, p95, p99] = quantiles(diff, [0.5, 0.7, 0.85, 0.9, 0.95, 0.99]);
console.log(`diff(A,orig) quantiles p50/p70/p85/p90/p95/p99 = ${p50}/${p70}/${p85}/${p90}/${p95}/${p99}, max=${maxDiff.toFixed(0)}`);

const THRESH = Math.max(30, p90);
const maskBin = Buffer.alloc(W * H);
let maskedPct = 0;
for (let i = 0; i < W * H; i++) {
  maskBin[i] = diff[i] >= THRESH ? 255 : 0;
  if (maskBin[i] === 255) maskedPct++;
}
console.log(`threshold=${THRESH} -> masked ${(maskedPct / (W * H) * 100).toFixed(1)}% of pixels (the hair region)`);

// Soften edges of the mask (blur + re-threshold) so the inpaint blends at the border
const maskPath = join(outDir, "1-hair-mask-diff.png");
await sharp(maskBin, { raw: { width: W, height: H, channels: 1 } })
  .blur(1.2)
  .png()
  .toFile(maskPath);
const maskRef = await sharp(maskPath).raw().toBuffer({ resolveWithObject: true });
const maskUrl = await fal.storage.upload(readFileSync(maskPath), { contentType: "image/png" });
console.log("mask saved:", maskPath, "| uploaded:", maskUrl, "\n");

// --- 2. Masked inpainting (only hair region regenerated) ---
const t1 = Date.now();
const input = { prompt: HAIR_PROMPT, image_url: await fal.storage.upload(readFileSync(ORIG), { contentType: "image/jpeg" }), mask_url: maskUrl, num_images: 1, output_format: "png", image_size: { width: W, height: H } };
let r;
try {
  r = await fal.subscribe("fal-ai/flux-lora/inpainting", { input, logs: true });
} catch (e) {
  console.log("image_size rejected, retrying without:", String(e).replace(/\s+/g, " ").slice(0, 160));
  const { image_size, ...rest } = input;
  r = await fal.subscribe("fal-ai/flux-lora/inpainting", { input: rest, logs: true });
}
const img = r.data?.images?.[0];
if (!img?.url) throw new Error("no image: " + JSON.stringify(r.data).slice(0, 300));
const cPath = join(outDir, "C-inpaint-masked.png");
const download = async (url) => {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return Buffer.from(await (await fetch(url)).arrayBuffer());
    } catch (e) {
      console.log(`  download attempt ${attempt} failed:`, e instanceof Error ? e.message : e);
      await new Promise((res) => setTimeout(res, 2500 * attempt));
    }
  }
  throw new Error("download failed after retries: " + url);
};
writeFileSync(cPath, await download(img.url));
console.log(`inpaint done in ${((Date.now() - t1) / 1000).toFixed(1)}s -> ${cPath} (${img.width}x${img.height})\n`);

// --- 3. Numeric claims: diff outside mask (must be ~0) and inside mask (must be >0) ---
const maskData = await sharp(maskPath).raw().toBuffer({ resolveWithObject: true }).then((x) => x.data);
const measure = async (label, path) => {
  const d = await loadRgb(path, W, H);
  let out = 0, nOut = 0, in_ = 0, nIn = 0;
  for (let i = 0; i < W * H; i++) {
    const v = (Math.abs(d[i * 3] - orig[i * 3]) + Math.abs(d[i * 3 + 1] - orig[i * 3 + 1]) + Math.abs(d[i * 3 + 2] - orig[i * 3 + 2])) / 3;
    if (maskData[i] > 25) { in_ += v; nIn++; } else { out += v; nOut++; }
  }
  console.log(
    `${label.padEnd(24)} OUTSIDE mask: ${(out / nOut).toFixed(2)} (face/background vs original) | INSIDE mask: ${(in_ / nIn).toFixed(2)} (hair changed)`
  );
};
console.log("--- per-pixel mean |RGB diff| vs ORIGINAL (0 = pixel-identical) ---");
await measure("C-inpaint-masked (masked)", cPath);
await measure("A-flux-ipadapter (current)", A_OUT);
console.log("\nArtifacts:", outDir);