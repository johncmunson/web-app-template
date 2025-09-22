"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Link Email/Password by setting an initial password (server-only)
export const setPasswordAction = async (newPassword: string) => {
  await auth.api.setPassword({
    body: { newPassword },
    headers: await headers(),
  })

  return { success: true }
}
