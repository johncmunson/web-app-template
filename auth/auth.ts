import "@/lib/envConfig"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { betterAuth } from "better-auth"
import { getEnvVar } from "@/lib/utils"

const nodeEnv = getEnvVar("NODE_ENV")
const isProd = nodeEnv === "production"

const githubClientId = getEnvVar("GITHUB_CLIENT_ID")
const githubClientSecret = getEnvVar("GITHUB_CLIENT_SECRET")

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
  },
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
  },
  plugins: [],
})
