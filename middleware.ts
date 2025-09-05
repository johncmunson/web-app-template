import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/auth/auth"

/**
 * ============================
 * Configuration & Utilities
 * ============================
 */

/**
 * Public UI routes that should NOT be protected.
 * - Add/remove paths as needed (e.g., /reset-password, /verify-email, etc.)
 * - Use prefixes for groups of routes (e.g., "/public" would skip "/public/...").
 */
const PUBLIC_ROUTES: readonly string[] = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
] as const

/**
 * Base path where Better Auth mounts its routes.
 * Keep this in sync with your better-auth configuration (defaults to "/api/auth").
 * We still exclude it in the matcher, but keeping it here makes the intent clear and
 * enables short-circuiting in case the matcher changes.
 */
const AUTH_BASE_PATH = process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth"

/**
 * If you anticipate adding more guards later (roles, AB tests, etc.),
 * this utility makes it trivial to add them to the pipeline without
 * rewriting the middleware structure.
 */
type Guard = (
  req: NextRequest,
) => Promise<NextResponse | void> | NextResponse | void

async function runGuards(
  req: NextRequest,
  guards: Guard[],
): Promise<NextResponse> {
  for (const guard of guards) {
    const res = await guard(req)
    if (res instanceof NextResponse) {
      // Short-circuit if a guard returns a response
      return res
    }
  }
  // If no guard returned a response, allow the request through.
  return NextResponse.next()
}

/**
 * Helper: Is this a public route? (prefix match)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (pub) => pathname === pub || pathname.startsWith(`${pub}/`),
  )
}

/**
 * Helper: Is this a Better Auth server route? (prefix match)
 * Note: We exclude it via matcher, but keeping this check makes the guard intent explicit.
 */
function isAuthServerRoute(pathname: string): boolean {
  return (
    pathname === AUTH_BASE_PATH || pathname.startsWith(`${AUTH_BASE_PATH}/`)
  )
}

/**
 * Helper: Is this request a client prefetch? (avoid doing heavy work)
 */
function isPrefetch(req: NextRequest): boolean {
  const prefetch1 = req.headers.get("next-router-prefetch")
  const prefetch2 = req.headers.get("purpose")
  return prefetch1 !== null || prefetch2 === "prefetch"
}

/**
 * Helper: Redirect to /sign-in with a callback back to the original URL
 * For HTML navigations we redirect; for non-HTML (APIs, fetch) we return 401 JSON.
 */
function redirectToSignIn(req: NextRequest): NextResponse {
  const wantsHTML = req.headers.get("accept")?.includes("text/html")
  const original = req.nextUrl.pathname + req.nextUrl.search

  if (!wantsHTML) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 },
    )
  }

  const url = new URL("/sign-in", req.url)
  url.searchParams.set("callbackURL", original)
  return NextResponse.redirect(url)
}

/**
 * ============================
 * Guards (extensible)
 * ============================
 */

/**
 * Guard 1: Short-circuit for public routes, better-auth routes, and prefetch requests.
 * Keep this guard first so we don’t do unnecessary work.
 */
const publicAndSystemGuard: Guard = (req) => {
  const { pathname } = req.nextUrl

  // Skip work for client prefetches
  if (isPrefetch(req)) return NextResponse.next()

  // Skip Better Auth server routes (e.g. /api/auth/*)
  if (isAuthServerRoute(pathname)) return NextResponse.next()

  // Skip public UI routes (e.g. /sign-in, /sign-up)
  if (isPublicRoute(pathname)) return NextResponse.next()
}

/**
 * Guard 2: Authentication guard (Better Auth).
 * Validates the session cookie via Better Auth.
 * If authenticated, do nothing (allow request through).
 * If not, redirect to /sign-in (or return 401 for non-HTML).
 */
const authGuard: Guard = async (req) => {
  // In middleware we already have the headers from the request.
  // We can pass them directly to better-auth to validate the session cookie.
  const session = await auth.api.getSession({ headers: req.headers })

  if (!session) {
    return redirectToSignIn(req)
  }

  // Authenticated — allow request through
  // If you want to add headers based on the session, do it here.
  return
}

/**
 * Example Guard 3 (template): Placeholder for future needs.
 * For example, role-based authorization, region checks, AB tests, etc.
 *
 * const roleGuard: Guard = async (req) => {
 *   const session = await auth.api.getSession({ headers: req.headers });
 *   if (session?.user.role !== "admin") {
 *     return NextResponse.redirect(new URL("/not-authorized", req.url));
 *   }
 * };
 */

/**
 * ============================
 * Middleware Entry
 * ============================
 */

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Compose your guards. Order matters:
  // 1) Cheap fast-path exclusions (public/system/prefetch)
  // 2) Auth
  // 3) (Optional) Role/feature guards, etc.
  return runGuards(req, [publicAndSystemGuard, authGuard])
}

/**
 * ============================
 * Matcher Configuration
 * ============================
 *
 * We target all paths EXCEPT:
 * - /api           (API routes)
 * - /_next/static  (Next.js static files)
 * - /_next/image   (Next.js image optimizer)
 * - static assets (common extensions)
 * - metadata files (favicon, sitemap, robots, manifest)
 *
 * We do not exclude /sign-in or /sign-up here intentionally so this file can be
 * reused in projects that might protect / (home) and then short-circuit in the guard.
 * If you prefer not to run the middleware at all for those routes, add them to the
 * negative lookahead below.
 */
export const config = {
  runtime: "nodejs" as const, // Use Node runtime so we can safely call auth.api.* from middleware
  matcher: [
    // Negative lookahead to exclude public/system paths & assets
    // You can add more extensions as needed.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|assets|fonts|.*\\.(?:css|js|mjs|map|png|jpg|jpeg|gif|svg|webp|avif|ico|bmp|tiff|woff|woff2|ttf|eot|otf|mp4|webm|mp3|wav)$).*)",
  ],
}
