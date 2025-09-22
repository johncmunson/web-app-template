"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Link Email/Password by setting an initial password (server-only)
export const setPasswordAction = async (newPassword: string) => {
  if (!newPassword || newPassword.trim().length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  await auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  })

  return { success: true }
}
