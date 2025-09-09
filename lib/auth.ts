import "@/lib/envConfig"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { getEnvVar } from "@/lib/utils"
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email-services"

const nodeEnv = getEnvVar("NODE_ENV")
const isProd = nodeEnv === "production"

const githubClientId = getEnvVar("GITHUB_CLIENT_ID")
const githubClientSecret = getEnvVar("GITHUB_CLIENT_SECRET")
const microsoftClientId = getEnvVar("MICROSOFT_CLIENT_ID")
const microsoftClientSecret = getEnvVar("MICROSOFT_CLIENT_SECRET")
const googleClientId = getEnvVar("GOOGLE_CLIENT_ID")
const googleClientSecret = getEnvVar("GOOGLE_CLIENT_SECRET")

export const auth = betterAuth({
  appName: "Web App Template",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    debugLogs: !isProd,
  }),
  advanced: {
    database: {
      generateId: false,
      useNumberId: true,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    updateAccountOnSignIn: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["email-password", "google", "github", "microsoft"],
    },
  },
  emailAndPassword: {
    enabled: true,
    // Allow the user to login and use the app without verifying their email.
    // We will require email verification for anything requiring payment or subscription.
    requireEmailVerification: false,
    // Automatically sign in the user after sign up
    autoSignIn: true,
    sendResetPassword: async (data, request) => {
      // Send an email to the user with a link to reset their password
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || getEnvVar("BETTER_AUTH_URL")
      const resetUrl = `${baseUrl}/reset-password?token=${data.token}`

      const result = await sendPasswordResetEmail(
        { email: data.user.email, name: data.user.name },
        resetUrl,
      )

      if (!result.success) {
        console.error("Failed to send password reset email:", result.error)
        throw new Error("Failed to send password reset email")
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Send an email to the user with the verification link
      const result = await sendVerificationEmail(
        { email: user.email, name: user.name },
        url,
      )

      if (!result.success) {
        console.error("Failed to send verification email:", result.error)
        throw new Error("Failed to send verification email")
      }
    },
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
    microsoft: {
      clientId: microsoftClientId,
      clientSecret: microsoftClientSecret,
    },
  },
  // make sure that nextCookies() comes last in the array
  plugins: [nextCookies()],
})
