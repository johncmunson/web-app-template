import { put, del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getEnvVar } from "@/lib/utils"
import { after } from "next/server"
import { compressImage } from "@/lib/compress-image"
import { toArrayBuffer } from "@/lib/to-array-buffer"

// This could be refactored to be a React server function instead,
// but then we wouldn't be able to use the `after` function from
// `next/server` to do the cleanup after the response is sent.

const vercelBlobToken = getEnvVar("VERCEL_BLOB_READ_WRITE_TOKEN")

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB
const AVATAR_DIMENSIONS = 512 // 512x512 pixels
const FILE_NAME = "avatar"
const FILE_EXTENSION = "webp"

/**
 * Handles avatar image upload for authenticated users.
 *
 * - Authenticates the user session.
 * - Parses and validates the uploaded file from the request payload.
 * - Compresses and resizes the image to fit avatar requirements.
 * - Uploads the processed image to Vercel Blob storage.
 * - Updates the user's profile image URL in the database.
 * - Cleans up the previous avatar image from storage after response.
 *
 * @param request - The incoming HTTP request containing the avatar file.
 * @returns A JSON response with the new avatar image URL, or an error response if authentication or validation fails.
 */
export async function POST(request: Request) {
  // Authenticate the user
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Parse and validate payload
  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) return new Response("No file", { status: 400 })
  if (file.size > MAX_UPLOAD_BYTES) {
    return new Response("File too large (max 10 MB)", { status: 400 })
  }

  // Convert File/Blob -> Uint8Array to be processed by sharp
  const arrayBuffer = await file.arrayBuffer()
  const original = new Uint8Array(arrayBuffer)

  const compressionOptions = {
    width: AVATAR_DIMENSIONS,
    height: AVATAR_DIMENSIONS,
    format: FILE_EXTENSION,
  } as const

  // Compress image to be under MAX_AVATAR_BYTES
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
  const body: ArrayBuffer = toArrayBuffer(uploadBytes)

  const blob = await put(`${FILE_NAME}.${FILE_EXTENSION}`, body, {
    access: "public",
    addRandomSuffix: true,
    token: vercelBlobToken,
  })

  // Update user image URL in database
  await auth.api.updateUser({
    body: { image: blob.url },
    headers: await headers(),
  })

  // Defer cleanup until after response is sent
  after(async () => {
    // Delete old image from Vercel Blob if it exists and is from Vercel Blob
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
  })

  return Response.json({ url: blob.url })
}
