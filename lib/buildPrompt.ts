import { HAIR_FIELDS, HairParams } from "./hairOptions";

export function validateHairParams(input: Record<string, unknown>): HairParams {
  const result: Record<string, string> = {};

  for (const field of HAIR_FIELDS) {
    const value = input[field.key];
    if (typeof value !== "string" || !field.options.includes(value)) {
      throw new Error(
        `Invalid value for "${field.key}": ${JSON.stringify(value)}`
      );
    }
    result[field.key] = value;
  }

  return result as unknown as HairParams;
}

export function buildPrompt(params: HairParams): {
  prompt: string;
  negativePrompt: string;
} {
  const { density, length, texture, color, hairline } = params;

  const prompt = [
    "A photorealistic close-up portrait photo of the same person,",
    "identical face, identical facial features, identical skin tone, identical expression, identical eyes,",
    `with ${density} density, ${length}, ${texture} hair,`,
    `${color} hair color,`,
    `a ${hairline} hairline,`,
    "natural studio lighting, sharp focus, high detail, unedited background.",
  ].join(" ");

  const negativePrompt = [
    "different person, different face, changed facial structure, changed eyes,",
    "changed skin tone, deformed, blurry, low quality, extra limbs, cartoon, illustration,",
    "watermark, text, disfigured, asymmetric face",
  ].join(" ");

  return { prompt, negativePrompt };
}
