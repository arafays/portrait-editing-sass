import { NextRequest, NextResponse } from "next/server";
import { fal } from "@/lib/fal";
import { buildPrompt, validateHairParams } from "@/lib/buildPrompt";
import { HAIR_FIELDS } from "@/lib/hairOptions";
import { IMAGE_TO_IMAGE_STRENGTH, IP_ADAPTER_CONFIG } from "@/lib/ipAdapterConfig";

export const runtime = "nodejs";

type FluxGeneralOutput = {
  images: { url: string; width: number; height: number; content_type: string }[];
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const photo = formData.get("photo");
  if (!(photo instanceof Blob) || photo.size === 0) {
    return NextResponse.json({ error: "A portrait photo is required." }, { status: 400 });
  }

  const rawParams: Record<string, unknown> = {};
  for (const field of HAIR_FIELDS) {
    rawParams[field.key] = formData.get(field.key);
  }

  let hairParams;
  try {
    hairParams = validateHairParams(rawParams);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid parameters." },
      { status: 400 }
    );
  }

  if (!process.env.FAL_KEY) {
    return NextResponse.json(
      { error: "FAL_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const faceImageUrl = await fal.storage.upload(photo);
    const { prompt, negativePrompt } = buildPrompt(hairParams);

    const result = await fal.subscribe("fal-ai/flux-general/image-to-image", {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image_url: faceImageUrl,
        strength: IMAGE_TO_IMAGE_STRENGTH,
        num_images: 1,
        ip_adapters: [
          {
            path: IP_ADAPTER_CONFIG.path,
            weight_name: IP_ADAPTER_CONFIG.weightName,
            image_encoder_path: IP_ADAPTER_CONFIG.imageEncoderPath,
            image_url: faceImageUrl,
            scale: IP_ADAPTER_CONFIG.scale,
          },
        ],
      },
    });

    const output = result.data as FluxGeneralOutput;
    const image = output.images?.[0];

    if (!image?.url) {
      return NextResponse.json(
        { error: "fal.ai did not return a generated image." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      resultUrl: image.url,
      width: image.width,
      height: image.height,
    });
  } catch (error) {
    console.error("fal.ai generation failed:", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 502 }
    );
  }
}
