"use server"

import { del, put, PutBlobResult } from "@vercel/blob"
import { getEnvVar } from "@/lib/utils"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { compressImage } from "@/lib/compress-image"
import { toArrayBuffer } from "@/lib/to-array-buffer"

const vercelBlobToken = getEnvVar("VERCEL_BLOB_READ_WRITE_TOKEN")

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB
const AVATAR_DIMENSIONS = 512 // 512x512 pixels
const FILE_NAME = "avatar"
const FILE_EXTENSION = "webp"

/**
 * Uploads an avatar image during user sign-up or profile update.
 *
 * Note: This could have also been implemented as an API route so that we could
 * leverage `after` to to defer Vercel Blob deletion until after returning to
 * the client, but since we have to handle the unauthenticated case for sign-up,
 * then it's a little safer to use a server action.
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
export async function uploadAvatarImage(formData: FormData) {
  // Try to get session (optional for sign-up)
  const requestHeaders = await headers()
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  // Parse and validate payload
  const imageFile = formData.get("image") as File
  if (!imageFile) throw new Error("No file")
  if (imageFile.size > MAX_UPLOAD_BYTES) {
    throw new Error("File too large (max 10 MB)")
  }

  // Convert File/Blob -> Uint8Array for processing
  const arrayBuffer = await imageFile.arrayBuffer()
  const original = new Uint8Array(arrayBuffer)

  const compressionOptions = {
    width: AVATAR_DIMENSIONS,
    height: AVATAR_DIMENSIONS,
    format: FILE_EXTENSION,
  } as const

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
        })

  // Convert Uint8Array -> ArrayBuffer slice for @vercel/blob `put`
  const blobPayload: ArrayBuffer = toArrayBuffer(uploadBytes)

  // Upload to Vercel Blob
  let blob: PutBlobResult
  try {
    blob = await put(`${FILE_NAME}.${FILE_EXTENSION}`, blobPayload, {
      access: "public",
      addRandomSuffix: true,
      token: vercelBlobToken,
    })
  } catch (error) {
    throw new Error("Failed to upload image to Vercel Blob")
  }

  // If we have a session, update the user's profile with the new image
  if (session) {
    try {
      await auth.api.updateUser({
        body: { image: blob.url },
        headers: requestHeaders,
      })
    } catch (error) {
      throw new Error("Failed to update user with new image")
    }
    // If the user's previous image was also on Vercel Blob, then delete it
    // NOTE: In the future, we could leverage an event-driven async job system
    // for work like this.
    if (
      session.user.image &&
      session.user.image.includes("vercel-storage.com")
    ) {
      try {
        await del(session.user.image, { token: vercelBlobToken })
      } catch (err) {
        console.error("Failed to delete old image", err)
      }
    }
  }

  // Return the new image URL
  return { url: blob.url }
}
