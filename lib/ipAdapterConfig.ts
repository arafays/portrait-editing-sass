// Flux.1-dev-compatible IP-Adapter used for face lock via fal-ai/flux-general.
// Verified end-to-end against the live API with a real photo. weight_name is
// required — the HF repo has exactly one weight file (ip-adapter.bin) but
// omitting the field still throws "Failed to download ip-adapter weights".
// image_encoder_path matches the siglip encoder hardcoded in that repo's own
// inference script (infer_flux_ipa_siglip.py).
//
// Identity lock quality is dominated by input framing, not these two knobs:
// a half-body/wide shot (face <10% of frame) produced visible identity drift;
// a head-and-shoulders crop of the same photo, resized to match
// resizeImage.ts's output, locked identity solidly at the same scale/strength.
// Encourage close, front-facing portrait uploads in the UI copy rather than
// tuning scale/strength first.
export const IP_ADAPTER_CONFIG = {
  path: "InstantX/FLUX.1-dev-IP-Adapter",
  weightName: "ip-adapter.bin",
  imageEncoderPath: "google/siglip-so400m-patch14-384",
  scale: 0.85,
};

export const IMAGE_TO_IMAGE_STRENGTH = 0.6;
