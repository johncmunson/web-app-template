import "@/lib/envConfig"
import { getEnvVar } from "@/lib/utils"
import type { Config } from "drizzle-kit"

export default {
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: getEnvVar("DATABASE_URL"),
  },
} satisfies Config
