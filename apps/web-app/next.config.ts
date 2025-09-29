import type { NextConfig } from "next"
import { getEnvVar } from "@/lib/utils"

const vercelBlobDomain = getEnvVar("VERCEL_BLOB_DOMAIN")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`${vercelBlobDomain}/**`)],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
}

export default nextConfig
