import "server-only";
import sharp from "sharp";

/**
 * Compress an image buffer to stay under a target size.
 *
 * @param input - The raw image buffer
 * @param targetBytes - Target maximum file size in bytes
 * @param options - Optional resize/format options
 */
export async function compressImage(
  input: Uint8Array,
  targetBytes: number,
  options?: {
    width?: number; // resize width
    height?: number; // resize height
    format?: "jpeg" | "png" | "webp"; // output format
    initialQuality?: number; // starting quality (default 80)
    minQuality?: number; // lowest allowed quality (default 40)
    step?: number; // quality decrement step (default 10)
  },
): Promise<Uint8Array> {
  const {
    width = 512,
    height = 512,
    format = "jpeg",
    initialQuality = 80,
    minQuality = 40,
    step = 10,
  } = options ?? {};

  let quality = initialQuality;

  let output = await sharp(input)
    .resize(width, height, { fit: "cover" })
    [format]({ quality })
    .toBuffer();

  // Reduce quality until under target size or until minQuality is hit
  while (output.length > targetBytes && quality > minQuality) {
    quality -= step;
    output = await sharp(input)
      .resize(width, height, { fit: "cover" })
      [format]({ quality })
      .toBuffer();
  }

  return output as Uint8Array;
}
