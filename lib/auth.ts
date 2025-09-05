import "@/lib/envConfig"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { getEnvVar } from "@/lib/utils"

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
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      // Send an email to the user with a link to reset their password
    },
  },
  // socialProviders: {
  //   google: {
  //     clientId: googleClientId,
  //     clientSecret: googleClientSecret,
  //   },
  //   github: {
  //     clientId: githubClientId,
  //     clientSecret: githubClientSecret,
  //   },
  //   microsoft: {
  //     clientId: microsoftClientId,
  //     clientSecret: microsoftClientSecret,
  //   },
  // },
  // make sure that nextCookies() comes last in the array
  plugins: [nextCookies()],
})
