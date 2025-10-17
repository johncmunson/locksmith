"use server";

import { del, type PutBlobResult, put } from "@vercel/blob";
import { headers } from "next/headers";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { compressImage } from "@/lib/compress-image";

type ResolvedType<T extends (...args: unknown[]) => unknown> = Awaited<
  ReturnType<T>
>;

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(
    u8.byteOffset,
    u8.byteOffset + u8.byteLength,
  ) as ArrayBuffer;
}

const vercelBlobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN as string;
const vercelBlobDomain = process.env.VERCEL_BLOB_DOMAIN as string;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_DIMENSIONS = 512; // 512x512 pixels
const FILE_NAME = "avatar";
const FILE_EXTENSION = "webp";

/**
 * Helper function to update the user's avatar and clean up the old image.
 */
async function updateUserAvatar(
  oldImage: string | null | undefined,
  newImageUrl: string,
  requestHeaders: ResolvedType<typeof headers>,
) {
  await auth.api.updateUser({
    body: { image: newImageUrl },
    headers: requestHeaders,
  });
  if (oldImage) {
    after(async () => {
      await cleanupOldAvatarImage(oldImage);
    });
  }
  return { url: newImageUrl };
}

/**
 * Uploads an avatar image during user sign-up or profile update.
 *
 * This function performs the following steps:
 * 1. Retrieves the current user session if it exists.
 * 2. Parses and validates the uploaded image file from the provided FormData.
 * 3. Compresses and converts the image to the desired format and dimensions.
 * 4. Uploads the processed image to Vercel Blob storage.
 * 5. If a session exists, updates the user's profile with the new image URL and
 *    deletes the previous image from Vercel Blob if applicable.
 * 6. Returns the URL of the newly uploaded image.
 *
 * @param formData - The FormData object containing the image file under the "image" key.
 * @returns An object containing the URL of the uploaded avatar image.
 * @throws Will throw an error if the image file is missing, too large, fails to upload,
 *         or fails to update the user profile.
 */
export async function setAvatarFromImageUpload(formData: FormData) {
  // Try to get session (optional for sign-up)
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const oldImage = session?.user.image;

  // Parse and validate payload
  const imageFile = formData.get("image") as File;
  if (!imageFile) throw new Error("No file");
  if (imageFile.size > MAX_UPLOAD_BYTES) {
    throw new Error("File too large (max 10 MB)");
  }

  // Convert File/Blob -> Uint8Array for processing
  const arrayBuffer = await imageFile.arrayBuffer();
  const original = new Uint8Array(arrayBuffer);

  const compressionOptions = {
    width: AVATAR_DIMENSIONS,
    height: AVATAR_DIMENSIONS,
    format: FILE_EXTENSION,
  } as const;

  // Compress image and convert to desired format
  const uploadBytes =
    original.byteLength > MAX_AVATAR_BYTES
      ? await compressImage(original, MAX_AVATAR_BYTES, compressionOptions)
      : // If the original is already under the limit, we still want to convert
        // it to the desired format and dimensions, so we run through the
        // compressor one last time at max quality.
        await compressImage(original, MAX_AVATAR_BYTES, {
          ...compressionOptions,
          initialQuality: 100,
        });

  // Convert Uint8Array -> ArrayBuffer slice for @vercel/blob `put`
  const blobPayload: ArrayBuffer = toArrayBuffer(uploadBytes);

  // Upload to Vercel Blob
  let blob: PutBlobResult;
  try {
    blob = await put(`${FILE_NAME}.${FILE_EXTENSION}`, blobPayload, {
      access: "public",
      addRandomSuffix: true,
      token: vercelBlobToken,
    });
  } catch (_err) {
    throw new Error("Failed to upload image to Vercel Blob");
  }

  if (session) {
    return await updateUserAvatar(oldImage, blob.url, requestHeaders);
  } else {
    return { url: blob.url };
  }
}

/**
 * Cleans up an old avatar image from Vercel Blob storage.
 *
 * This function is used when a user changes their avatar via linked accounts
 * or other methods, and we need to delete the previous image that was stored
 * on Vercel Blob.
 *
 * @param oldImageUrl - The URL of the old image to delete.
 * @throws Will throw an error if the deletion fails.
 */
export async function cleanupOldAvatarImage(oldImageUrl: string) {
  // Only delete if it's a Vercel Blob image
  if (oldImageUrl?.includes(vercelBlobDomain)) {
    try {
      await del(oldImageUrl, { token: vercelBlobToken });
    } catch (error) {
      console.error("Failed to delete old avatar image", error);
      throw new Error("Failed to delete old avatar image");
    }
  } else {
    console.warn(
      `Old image URL is not a Vercel Blob avatar image, skipping deletion: ${oldImageUrl}`,
    );
  }
}

/**
 * Sets the user's avatar to an image from one of their linked accounts.
 *
 * @param imageUrl - The image URL from the linked account.
 * @throws Will throw an error if unauthorized or update fails.
 */
export async function setAvatarFromLinkedAccount(imageUrl: string) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Invalid image URL");
  }

  const oldImage = session.user.image;

  return await updateUserAvatar(oldImage, imageUrl, requestHeaders);
}

/**
 * Sets the user's avatar to their initials.
 *
 * @param initials - The two-character initials string.
 * @throws Will throw an error if unauthorized, invalid initials, or update fails.
 */
export async function setAvatarFromInitials(initials: string) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!initials || typeof initials !== "string" || initials.length !== 2) {
    throw new Error("Invalid initials");
  }

  const oldImage = session.user.image;

  return await updateUserAvatar(
    oldImage,
    initials.toUpperCase(),
    requestHeaders,
  );
}
