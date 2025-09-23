import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getEnvVar } from "@/lib/utils"
import { after } from "next/server"

const vercelBlobToken = getEnvVar("VERCEL_BLOB_READ_WRITE_TOKEN")

export async function POST(request: Request) {
  // Authenticate the user
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Parse and validate payload
  const { initials } = await request.json()
  if (!initials || typeof initials !== "string" || initials.length !== 2) {
    return new Response("Invalid initials", { status: 400 })
  }

  // Defer cleanup until after response is sent
  after(async () => {
    // Delete old image from Vercel Blob if it exists and is from Vercel Blob
    if (
      session.user.image &&
      session.user.image.includes("vercel-storage.com")
    ) {
      try {
        await del(session.user.image, { token: vercelBlobToken })
      } catch (error) {
        console.error("Failed to delete old image", error)
      }
    }
  })

  // Update user image to initials
  await auth.api.updateUser({
    body: { image: initials.toUpperCase() },
    headers: await headers(),
  })

  return Response.json({ success: true })
}
