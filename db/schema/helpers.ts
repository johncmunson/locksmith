import { integer, timestamp } from "drizzle-orm/pg-core";

/**
 * The `timestamps` object adds `createdAt` and `updatedAt` columns to your tables:
 * - `createdAt` is set automatically on insert.
 * - `updatedAt` is set automatically on insert and on every update (handled by Drizzle).
 * Most of the time, your app code doesn't need to worry about these, Drizzle manages them for you.
 * If you update rows outside Drizzle (like in a DB GUI), you'll need to set `updatedAt` manually.
 */
const timestamps = {
  createdAt: timestamp({ withTimezone: true })
    // The db engine creates a new timestamp on row insert
    .defaultNow()
    .notNull(),
  updatedAt: timestamp({ withTimezone: true })
    // The db engine creates a new timestamp on row insert
    .defaultNow()
    // Drizzle creates a new timestamp on row insert or row update
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export const reusableColumns = {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  ...timestamps,
};
