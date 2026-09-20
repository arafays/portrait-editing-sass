// Identity-control test for fal-ai/flux-lora/inpainting:
// Input already at the endpoint's canonical size (896x1536), tiny 20x20 mask patch.
// If inpainting composites unmasked pixels byte-identically, everything outside the
// patch will be ~0 diff from the source; the patch itself must change (red dot),
// which also confirms white-mask = "regenerate this region".
// Run: set -a && source .env.local && set +a && node scripts/control-inpaint.mjs
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { fal } from "@fal-ai/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIG = join(root, "test-results/face-lock-validation/test-2/original.jpg");
const outDir = join(root, "test-results/face-lock-validation/alt-pipelines");
const W = 896, H = 1536;

// 1. Source at canonical bucket size
const srcPath = join(outDir, "90-control-src.png");
await sharp(ORIG).resize(W, H, { kernel: "lanczos3" }).png().toFile(srcPath);
const srcUrl = await fal.storage.upload(readFileSync(srcPath), { contentType: "image/png" });

// 2. Tiny mask patch in a neutral background spot
const PX = 400, PY = 1400; // patch top-left
const mask = Buffer.alloc(W * H); // black = keep
for (let y = PY; y < PY + 20; y++) for (let x = PX; x < PX + 20; x++) mask[y * W + x] = 255;
const maskPath = join(outDir, "90-control-mask.png");
await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).png().toFile(maskPath);
const maskUrl = await fal.storage.upload(readFileSync(maskPath), { contentType: "image/png" });

// 3. Inpaint
const t = Date.now();
const r = await fal.subscribe("fal-ai/flux-lora/inpainting", {
  input: {
    prompt: "Add one small bright red dot in the masked region. Change nothing else about the photo.",
    image_url: srcUrl,
    mask_url: maskUrl,
    num_images: 1,
    output_format: "png",
  },
  logs: true,
});
const img = r.data?.images?.[0];
if (!img?.url) throw new Error("no image: " + JSON.stringify(r.data).slice(0, 300));
console.log(`\ncontrol gen done in ${((Date.now() - t) / 1000).toFixed(1)}s -> output ${img.width}x${img.height}`);

const outPath = join(outDir, "90-control-output.png");
const download = async (url) => {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try { return Buffer.from(await (await fetch(url)).arrayBuffer()); } catch (e) {
      console.log("  download retry", attempt, e instanceof Error ? e.message : e);
      await new Promise((res) => setTimeout(res, 2500 * attempt));
    }
  }
  throw new Error("download failed");
};
writeFileSync(outPath, await download(img.url));

// 4. Metrics at native dims
const oRaw = await sharp(outPath).raw().toBuffer({ resolveWithObject: true });
const sRaw = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
const ow = oRaw.info.width, oh = oRaw.info.height;
console.log(`analysis at output size ${ow}x${oh}`);
const O = oRaw.data, S = sRaw.data;
const inPatch = (x, y) => x >= PX && x < PX + 20 && y >= PY && y < PY + 20;
let out = 0, nOut = 0, maxOut = 0, exactEq = 0, nOutExact = 0, in_ = 0, nIn = 0;
for (let y = 0; y < oh; y++) {
  for (let x = 0; x < ow; x++) {
    const i = y * ow + x;
    const v = (Math.abs(O[i * 3] - S[i * 3]) + Math.abs(O[i * 3 + 1] - S[i * 3 + 1]) + Math.abs(O[i * 3 + 2] - S[i * 3 + 2])) / 3;
    if (inPatch(x, y)) { in_ += v; nIn++; }
    else {
      out += v; nOut++;
      if (v > maxOut) maxOut = v;
      if (O[i * 3] === S[i * 3] && O[i * 3 + 1] === S[i * 3 + 1] && O[i * 3 + 2] === S[i * 3 + 2]) exactEq++;
      nOutExact++;
    }
  }
}
console.log(`OUTSIDE patch: mean diff ${(out / nOut).toFixed(3)}, max diff ${maxOut.toFixed(1)}, byte-exact pixels ${(exactEq / nOutExact * 100).toFixed(2)}%`);
console.log(`INSIDE patch : mean diff ${(in_ / nIn).toFixed(2)} (expect clearly > 0: the red dot)`);
console.log("\nReading — outside ~0 & ~100% byte-exact => endpoint composites unmasked pixels from source (provable face lock at matching dims).");
console.log("Artifacts:", outDir);