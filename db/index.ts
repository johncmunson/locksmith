import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * DB INITIALIZATION STRATEGY
 * ──────────────────────────────────────────────────────────────────────────────
 * This module creates a single pg Pool and a Drizzle instance and exports both.
 *
 * It handles three execution contexts with different lifecycles:
 *
 * 1) DEVELOPMENT (Next.js dev server with HMR)
 *    - HMR reloads modules on file changes. Without care, each reload would
 *      create a new Pool (and new DB connections), quickly exhausting the DB.
 *    - We store the Pool/DB on globalThis **only in dev** so HMR reuses them.
 *
 * 2) TEST (Vitest integration tests)
 *    - NODE_ENV is typically "test". We **do not** cache on globalThis so each
 *      test worker/process gets a fresh Pool (better isolation, fewer surprises).
 *    - We also **do not** attach the Vercel Fluid cleanup hook in tests.
 *
 * 3) PRODUCTION (Vercel Fluid compute)
 *    - Modules do not hot-reload. Each instance holds one Pool in memory.
 *    - We call attachDatabasePool(pool) so Fluid can close idle clients cleanly
 *      before the instance is suspended, preventing "leaked" connections.
 *
 * Pool sizing:
 *  - max:   modest numbers (10 in prod, 5 elsewhere) to avoid stampeding the DB,
 *           yet allow concurrency per instance.
 *  - idleTimeoutMillis:
 *           short (5s in prod, 1s in non-prod) so unused clients are recycled
 *           quickly; this works well with Fluid's lifecycle + the attach helper.
 *
 * Client-side pooling + Neon pooler:
 *  - Using a pg Pool on the client side **and** a Neon pooled endpoint is safe
 *    here because:
 *      a) We always release clients back to the app pool promptly.
 *      b) Fluid's attachDatabasePool ensures idle clients are closed before
 *         suspension (so no lingering "leaks").
 *  - This pattern is portable to other Postgres providers (e.g., RDS). If you
 *    switch later, you typically just swap DATABASE_URL (and remove "-pooler").
 *
 * Drizzle casing: { casing: "snake_case" }
 *  - Maps JS identifiers to SQL names in snake_case (e.g., `createdAt` -> `created_at`)
 *    so your TypeScript objects can stay idiomatic while the DB uses conventional
 *    snake_case columns/tables.
 *
 * Further reading:
 *  - Connection Pooling with Vercel Functions
 *    https://vercel.com/guides/connection-pooling-with-functions
 *  - The real serverless compute to database connection problem, solved:
 *    https://vercel.com/blog/the-real-serverless-compute-to-database-connection-problem-solved
 *  - Connect to Neon
 *    https://neon.com/docs/connect/connect-intro
 */

// Environment flags
const isProd = process.env.NODE_ENV! === "production";
const isDev = process.env.NODE_ENV! === "development";

/**
 * In development, we cache the Pool and Drizzle instance on globalThis to
 * survive Next.js HMR module reloads. In test and prod, we don't cache:
 *  - test: better isolation per worker/process.
 *  - prod: no HMR, so no need; the instance lifetime is managed by the platform.
 */
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

/**
 * Create (or reuse, in dev) a single pg Pool.
 *
 * Why these values?
 * - max:
 *   - production: 10 -> allows per-instance concurrency without overwhelming the DB.
 *     Fluid can run multiple concurrent requests on one instance; 10 is a sane,
 *     conservative starting point that you can tune later.
 *   - non-prod: 5 -> dev/test are lighter; keep it small to avoid noisy neighbors.
 *
 * - idleTimeoutMillis:
 *   - production: 5000 ms -> short enough to free idle clients quickly (good for
 *     elasticity) but long enough to allow rapid reuse under bursty traffic.
 *   - non-prod: 1000 ms -> quick recycle during dev/test; keeps things snappy and
 *     avoids connection accumulation during frequent restarts.
 *
 * Note: These are sensible defaults, not absolutes. Monitor and tune as needed.
 */
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: isProd ? 10 : 5,
    idleTimeoutMillis: isProd ? 5000 : 1000,
  });

/**
 * Production (Vercel Fluid compute):
 * - attachDatabasePool integrates the pool lifecycle with Fluid.
 * - It ensures idle connections are properly closed before the instance is
 *   suspended, preventing the classic "serverless leaked connections" issue.
 *
 * Dev & Test:
 * - We skip it. In dev, HMR is handled via globalThis caching. In tests, each
 *   worker has its own process and we tear the pool down explicitly (e.g., in
 *   an afterAll hook) with `await pool.end()`.
 */
if (isProd) {
  attachDatabasePool(pool);
}

/**
 * Create (or reuse, in dev) a Drizzle instance bound to our Pool and schema.
 *
 * `casing: "snake_case"`:
 * - Drizzle maps JS identifiers to SQL snake_case automatically. This lets your
 *   TS models use camelCase fields while your database uses snake_case columns,
 *   which is conventional in SQL schemas and plays nicely with tools/migrations.
 */
const db = globalForDb.db ?? drizzle(pool, { schema, casing: "snake_case" });

/**
 * DEV-ONLY HMR CACHING
 * - Next.js dev server hot-reloads files on save.
 * - Without this cache, every reload would construct a new Pool -> more TCP
 *   connections -> potential "too many connections".
 * - By stashing on globalThis, subsequent imports reuse the same instances.
 */
if (isDev) {
  globalForDb.pool = pool;
  globalForDb.db = db;
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Portability notes (e.g., moving to AWS RDS)
 * ──────────────────────────────────────────────────────────────────────────────
 * - Code stays the same. Swap DATABASE_URL to point at your new Postgres host.
 * - If you used a Neon **pooled** URL (the hostname includes "-pooler"),
 *   RDS won't have that notion; either:
 *     - use RDS directly (often fine at modest scale), or
 *     - adopt RDS Proxy (or pgbouncer) if you need high connection fan-in.
 * - Keep the same pg Pool and Drizzle usage. Transactions and queries are unchanged.
 * - Migrations: continue to prefer a **direct** (non-pooled) connection for schema
 *   migrations, regardless of provider, to avoid pooling mode quirks.
 */

export { db, pool };
