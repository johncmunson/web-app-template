import { loadEnvConfig } from "@next/env"

// https://nextjs.org/docs/app/guides/environment-variables#loading-environment-variables-with-nextenv

const projectDir = process.cwd()
loadEnvConfig(projectDir)
