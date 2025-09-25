import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getEnvVar } from "@/lib/utils"
import { after } from "next/server"

// This could be refactored to be a React server function instead,
// but then we wouldn't be able to use the `after` function from
// `next/server` to do the cleanup after the response is sent.

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
  // NOTE: In the future, we could leverage an event-driven async job system
  // for work like this.
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
