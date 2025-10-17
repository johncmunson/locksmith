/**
 * ADAPTED FROM SIMILAR UTILITIES USED IN CLERK AND CONVEX
 */

import type Link from "next/link";
import type { NextRequest } from "next/server";
import { pathToRegexp } from "@/vendor/path-to-regexp";

/**
 * Types: give you autocompletion for Next typed routes (optional).
 */
type NextTypedRoute<T = Parameters<typeof Link>["0"]["href"]> = T extends string
  ? T
  : never;
type WithPathPatternWildcard<T> = `${T & string}(.*)`;
type Autocomplete<U extends T, T = string> = U | (T & Record<never, never>);

/**
 * You can accept:
 * - Plain strings (with path-to-regexp syntax)
 * - RegExp
 * - Function predicate
 * - Arrays of the above
 */
export type RouteMatcherParam =
  | (RegExp | RouteMatcherWithNextTypedRoutes)[]
  | RegExp
  | RouteMatcherWithNextTypedRoutes
  | ((req: NextRequest) => boolean);

export type RouteMatcherWithNextTypedRoutes = Autocomplete<
  WithPathPatternWildcard<NextTypedRoute>
>;

/**
 * Create a route matcher for runtime checks (inside middleware).
 * Use this function at module scope in middleware.ts, instead of inline within
 * the middleware function, so that the regexes are precomputed once at cold
 * start instead of on every request.
 *
 * For routes, use (.*) to treat each entry as a prefix group; remove (.*) for exact-only.
 *
 * @example
 * // Prefix matchers (recommended)
 * const isPublicRoute = createRouteMatcher([ "/sign-in(.*)", "/sign-up(.*)" ])
 *
 * // Exact matchers only
 * const isPublicRoute = createRouteMatcher([ "/sign-in", "/sign-up" ])
 *
 * // Function predicate (most flexible, but no precomputation)
 * const isPublicRoute = createRouteMatcher((req) => req.nextUrl.pathname === "/sign-in" || req.nextUrl.pathname === "/sign-up")
 */
export function createRouteMatcher(routes: RouteMatcherParam) {
  if (typeof routes === "function") {
    return (req: NextRequest) => routes(req);
  }
  const patterns = [routes || ""].flat().filter(Boolean);
  const matchers = precomputePathRegex(patterns);
  return (req: NextRequest) =>
    matchers.some((m) => m.test(req.nextUrl.pathname));
}

/** Convert strings to RegExp just once */
function precomputePathRegex(patterns: (string | RegExp)[]) {
  return patterns.map((p) =>
    p instanceof RegExp ? p : pathToRegexp(p).regexp,
  );
}
