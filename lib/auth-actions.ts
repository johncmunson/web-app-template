import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Example: Getting Session on a server action
export const getSessionAction = async () => {
  "use server"
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

// Example: Sign in with email and password
export const signInAction = async (formData: FormData) => {
  "use server"
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    })
    // Cookies will be automatically set thanks to nextCookies plugin
  } catch (error) {
    throw error
  }
}

// Example: Sign up with email and password
export const signUpAction = async (formData: FormData) => {
  "use server"
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    })
    // Cookies will be automatically set thanks to nextCookies plugin
  } catch (error) {
    throw error
  }
}
