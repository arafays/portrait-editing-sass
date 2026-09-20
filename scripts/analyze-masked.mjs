// Local re-analysis of C-inpaint-masked at its NATIVE resolution (896x1536),
// removing our resize-back interpolation from the face-untouched metric.
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const d = join(root, "test-results/face-lock-validation/alt-pipelines");
const ORIG = join(root, "test-results/face-lock-validation/test-2/original.jpg");
const C = join(d, "C-inpaint-masked.png");
const A = join(d, "A-flux-ipadapter.png");
const MASK = join(d, "1-hair-mask-diff.png");

const cRaw = await sharp(C).raw().toBuffer({ resolveWithObject: true });
const W = cRaw.info.width, H = cRaw.info.height;
console.log(`C native size: ${W}x${H}`);

const resizeRgb = async (p, w, h, k = "lanczos3") =>
  (await sharp(p).resize(w, h, { kernel: k }).removeAlpha().raw().toBuffer({ resolveWithObject: true })).data;
const maskResize = async (p, w, h) =>
  (await sharp(p).resize(w, h, { kernel: "nearest" }).raw().toBuffer({ resolveWithObject: true })).data;

const c = cRaw.data;
const origR = await resizeRgb(ORIG, W, H);
const aR = await resizeRgb(A, W, H);
const mask = await maskResize(MASK, W, H);

const offOrig = await resizeRgb(ORIG, W, H); // same as origR but keep helper semantics

const measure = (label, lhs, rhs) => {
  let out = 0, nOut = 0, in_ = 0, nIn = 0;
  for (let i = 0; i < W * H; i++) {
    const v = (Math.abs(lhs[i * 3] - rhs[i * 3]) + Math.abs(lhs[i * 3 + 1] - rhs[i * 3 + 1]) + Math.abs(lhs[i * 3 + 2] - rhs[i * 3 + 2])) / 3;
    if (mask[i] > 25) { in_ += v; nIn++; } else { out += v; nOut++; }
  }
  console.log(`${label.padEnd(36)} OUTSIDE mask: ${(out / nOut).toFixed(2)} | INSIDE mask: ${(in_ / nIn).toFixed(2)}`);
};

console.log("mean |RGB diff| vs ORIGINAL at C's native size (0 = pixel-identical to source):");
measure("C-inpaint-masked  (masked path) ", c, origR);   // outside-mask ~0 => face untouched
measure("A-flux-ipadapter  (current)     ", aR, origR);   // outside-mask drift of current pipeline
console.log("\n(OUTSIDE mask = face/background. Mean |channel diff|, 0-255 range; <~2 after resampling = practically identical.)");