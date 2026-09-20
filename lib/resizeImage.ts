const MAX_DIMENSION = 1568;
const JPEG_QUALITY = 0.85;

export async function resizeImageForUpload(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to encode the resized photo."));
        }
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

const THUMBNAIL_MAX_DIMENSION = 240;
const THUMBNAIL_JPEG_QUALITY = 0.72;

export async function createThumbnailDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, THUMBNAIL_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", THUMBNAIL_JPEG_QUALITY);
}
