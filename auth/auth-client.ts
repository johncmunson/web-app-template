import { createAuthClient } from "better-auth/client"
import type { auth } from "@/auth/auth"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // This field may be ommitted if the auth server is running on the same domain as your client
  // Consider ommitting so that better-auth uses relative URLs which will help prevent misconfig
  // between environments (dev, staging, prod, etc).
  baseURL: "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
})
