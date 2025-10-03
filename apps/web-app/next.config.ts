import type { NextConfig } from "next"
import { getEnvVar } from "@/lib/utils"

const vercelBlobDomain = getEnvVar("VERCEL_BLOB_DOMAIN")

const nextConfig: NextConfig = {
  // TODO: Investigate whether or not this line is really necessary
  // transpilePackages: ["@web-app-template/ui"],
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
