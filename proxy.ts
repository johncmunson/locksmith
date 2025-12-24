import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRouteMatcher } from "@/vendor/route-matcher";

/**
 * ============================
 * Configuration & Utilities
 * ============================
 */

/**
 * Helper: Redirect to /sign-in with a callback back to the original URL
 */
function redirectToSignIn(req: NextRequest): NextResponse {
  const original = req.nextUrl.pathname + req.nextUrl.search;
  const url = new URL("/sign-in", req.url);
  if (original !== "/") {
    url.searchParams.set("callbackURL", original);
  }
  return NextResponse.redirect(url);
}

/**
 * Represents a middleware guard function that can process a Next.js request.
 *
 * @param req - The incoming Next.js request object.
 * @returns A `NextResponse` to short-circuit the middleware chain, or `undefined` to continue processing.
 *          The return value can be synchronous or a Promise.
 */
type Guard = (
  req: NextRequest,
) => Promise<NextResponse | undefined> | NextResponse | undefined;

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
    const res = await guard(req);
    if (res instanceof NextResponse) {
      // Short-circuit if a guard returns a response
      return res;
    }
  }
  // If no guard returned a response, allow the request through.
  return NextResponse.next();
}

/**
 * ============================
 * Route Matchers
 * ============================
 */

/**
 * Is this a public route? (prefix match)
 */
const isPublicAuthRoute = createRouteMatcher([
  /^\/sign-in($|\/.*)/,
  /^\/sign-up($|\/.*)/,
  /^\/forgot-password($|\/.*)/,
  /^\/verify-email($|\/.*)/,
  /^\/reset-password($|\/.*)/,
]);

/**
 * Is this a Next.js system route?
 */
const isSystemRoute = createRouteMatcher([/^\/_next\//]);

/**
 * Is this a static asset route?
 */
const isStaticAsset = createRouteMatcher([
  /\.(svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|tiff|tif|js|css|json|xml|txt)$/i,
]);

/**
 * Is this an API route?
 * By excluding /api routes, we are making the conscious decision to keep this
 * middleware focused on protecting UI routes only, while deferring API route
 * protection to other means, since API routes often have different needs such
 * as returning JSON 401 responses instead of redirects, rate limiting, etc.
 */
const isApiRoute = createRouteMatcher([/^\/api\//]);

/**
 * ============================
 * Guards (extensible)
 * ============================
 */

/**
 * Guard 1: Short-circuit for public routes, better-auth routes, prefetch requests, etc.
 * Keep this guard first so we don’t do unnecessary work.
 */
const shortCircuitGuard: Guard = (req) => {
  if (
    isSystemRoute(req) ||
    isApiRoute(req) ||
    isStaticAsset(req) ||
    isPublicAuthRoute(req)
  ) {
    return NextResponse.next();
  }

  // Fall-through = protected
};

/**
 * Guard 2: Authentication guard (Better Auth).
 * Validates the session cookie via Better Auth.
 * If authenticated, do nothing (allow request through).
 * If not, redirect to /sign-in.
 */
const authGuard: Guard = async (req) => {
  // Validate the session via Better Auth using request headers
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return redirectToSignIn(req);

  // Authenticated - allow request through
  // If you want to add headers based on the session, do it here.
};

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

export async function proxy(req: NextRequest): Promise<NextResponse> {
  // Compose your guards. Order matters:
  // 1) Cheap fast-path exclusions (public/system/prefetch)
  // 2) Auth
  // 3) (Optional) Role/feature guards, etc.
  return runGuards(req, [shortCircuitGuard, authGuard]);
}

/**
 * ============================
 * Matcher Configuration
 * ============================
 */

export const config = {
  matcher: [
    /*
     * Match all paths - we'll handle exclusions in the middleware function itself
     * This ensures we have full control over what gets processed
     */
    "/(.*)",
  ],
};
