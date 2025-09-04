import "@/lib/envConfig"
import { getEnvVar } from "@/lib/utils"
import type { Config } from "drizzle-kit"

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnvVar("DATABASE_URL"),
  },
} satisfies Config
