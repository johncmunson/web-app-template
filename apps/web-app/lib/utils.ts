export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env var: ${key}`)
  }
  return value
}

export function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
