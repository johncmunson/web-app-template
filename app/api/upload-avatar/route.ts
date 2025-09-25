import { put, del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getEnvVar } from "@/lib/utils"
import { after } from "next/server"
import { compressImage } from "@/lib/compress-image"
import { toArrayBuffer } from "@/lib/to-array-buffer"

const vercelBlobToken = getEnvVar("VERCEL_BLOB_READ_WRITE_TOKEN")

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB
const AVATAR_DIMENSIONS = 512 // 512x512 pixels
const FILE_NAME = "avatar"
const FILE_EXTENSION = "webp"

/**
 * Handles avatar image upload.
 * - If authenticated (session exists), updates the user's profile and cleans up old image.
 * - If not authenticated (e.g., sign-up), just uploads and returns the URL.
 * @param request - The incoming HTTP request containing the avatar file.
 * @returns A JSON response with the new avatar image URL, or an error response if authentication or validation fails.
 */
export async function POST(request: Request) {
  // Try to get session (optional for sign-up)
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Parse and validate payload
  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) return new Response("No file", { status: 400 })
  if (file.size > MAX_UPLOAD_BYTES) {
    return new Response("File too large (max 10 MB)", { status: 400 })
  }

  // Convert File/Blob -> Uint8Array for processing
  const arrayBuffer = await file.arrayBuffer()
  const original = new Uint8Array(arrayBuffer)

  const compressionOptions = {
    width: AVATAR_DIMENSIONS,
    height: AVATAR_DIMENSIONS,
    format: FILE_EXTENSION,
  } as const

  // Compress image
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

  // Upload to Vercel Blob
  const blob = await put(`${FILE_NAME}.${FILE_EXTENSION}`, body, {
    access: "public",
    addRandomSuffix: true,
    token: vercelBlobToken,
  })

  // If session exists, update user and schedule cleanup
  if (session) {
    await auth.api.updateUser({
      body: { image: blob.url },
      headers: await headers(),
    })

    if (
      session.user.image &&
      session.user.image.includes("vercel-storage.com")
    ) {
      after(async () => {
        try {
          await del(session.user.image!, { token: vercelBlobToken })
        } catch (err) {
          console.error("Failed to delete old image", err)
        }
      })
    }
  }

  return Response.json({ url: blob.url })
}
