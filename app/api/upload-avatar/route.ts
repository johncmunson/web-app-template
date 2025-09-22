import { put, del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getEnvVar } from "@/lib/utils"

const vercelBlobToken = getEnvVar("VERCEL_BLOB_READ_WRITE_TOKEN")

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) {
    return new Response("No file", { status: 400 })
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
    token: vercelBlobToken,
  })

  // Update user image URL in database
  await auth.api.updateUser({
    body: { image: blob.url },
    headers: await headers(),
  })

  // Delete old image from Vercel Blob if it exists and is from Vercel Blob
  if (session.user.image && session.user.image.includes("vercel-storage.com")) {
    try {
      await del(session.user.image, { token: vercelBlobToken })
    } catch (error) {
      console.error("Failed to delete old image", error)
    }
  }

  return Response.json({ url: blob.url })
}
