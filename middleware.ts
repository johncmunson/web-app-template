import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { createRouteMatcher } from "@/lib/route-matcher"

/**
 * ============================
 * Configuration & Utilities
 * ============================
 */

/**
 * Base path where Better Auth mounts its routes.
 * Keep this in sync with your better-auth configuration (defaults to "/api/auth").
 * We still exclude all /api routes in the matcher, but keeping it here makes the
 * intent clear and enables short-circuiting in case the matcher changes.
 */
const AUTH_BASE_PATH = "/api/auth"

/**
 * Helper: Redirect to /sign-in with a callback back to the original URL
 */
function redirectToSignIn(req: NextRequest): NextResponse {
  const original = req.nextUrl.pathname + req.nextUrl.search
  const url = new URL("/sign-in", req.url)
  url.searchParams.set("callbackURL", original)
  return NextResponse.redirect(url)
}

/**
 * Represents a middleware guard function that can process a Next.js request.
 *
 * @param req - The incoming Next.js request object.
 * @returns A `NextResponse` to short-circuit the middleware chain, or `void` to continue processing.
 *          The return value can be synchronous or a Promise.
 */
type Guard = (
  req: NextRequest,
) => Promise<NextResponse | void> | NextResponse | void

/**
 * If you anticipate adding more guards later (roles, AB tests, etc.),
 * this utility makes it trivial to add them to the pipeline without
 * rewriting the middleware structure.
 */
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
 * ============================
 * Route Matchers
 * ============================
 */

/**
 * Is this a public route? (prefix match)
 */
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/verify-email(.*)",
])

/**
 * Is this a Better Auth server route? (prefix match)
 */
const isAuthServerRoute = createRouteMatcher([`${AUTH_BASE_PATH}(.*)`])

/**
 * Is this request a client prefetch? (avoid doing heavy work)
 */
function isPrefetch(req: NextRequest): boolean {
  const prefetch1 = req.headers.get("next-router-prefetch")
  const prefetch2 = req.headers.get("purpose")
  return prefetch1 !== null || prefetch2 === "prefetch"
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
  if (isPrefetch(req)) return NextResponse.next()
  if (isAuthServerRoute(req)) return NextResponse.next()
  if (isPublicRoute(req)) return NextResponse.next()
  // Fall-through = protected
}

/**
 * Guard 2: Authentication guard (Better Auth).
 * Validates the session cookie via Better Auth.
 * If authenticated, do nothing (allow request through).
 * If not, redirect to /sign-in.
 */
const authGuard: Guard = async (req) => {
  // In middleware we already have the headers from the request.
  // We can pass them directly to better-auth to validate the session cookie.
  const session = await auth.api.getSession({ headers: req.headers })

  if (!session) return redirectToSignIn(req)

  // Authenticated — allow request through
  // If you want to add headers based on the session, do it here.
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
 * By excluding /api routes, we are making the conscious decision to keep this
 * middleware focused on protecting UI routes only, while deferring API route
 * protection to other means, since API routes often have different needs such
 * as returning JSON 401 responses instead of redirects, rate limiting, etc.
 *
 * We do not exclude UI routes that need to remain public, such as auth routes
 * like /sign-in or /sign-up, so that we don't create confusion between when the
 * matcher is responsible for and what the guards are responsible for. To keep
 * the mental model simple, we are using the matcher to exclude big buckets of
 * traffic that definitely do not need the middleware, and leaving all fine-
 * grained logic to the guards above.
 *
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
