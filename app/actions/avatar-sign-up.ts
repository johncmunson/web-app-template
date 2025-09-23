"use server"

import { put } from "@vercel/blob"
import { getEnvVar } from "@/lib/utils"

const vercelBlobToken = getEnvVar("VERCEL_BLOB_READ_WRITE_TOKEN")

export async function uploadAvatarImage(formData: FormData) {
  const imageFile = formData.get("image") as File
  if (!imageFile) throw new Error("No file selected")

  try {
    const blob = await put("avatar", imageFile, {
      access: "public",
      addRandomSuffix: true,
      token: vercelBlobToken,
    })
    return { url: blob.url }
  } catch (error) {
    throw new Error("Upload failed")
  }
}
