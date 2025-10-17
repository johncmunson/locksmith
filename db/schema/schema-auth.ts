import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { reusableColumns } from "./helpers";

export const users = pgTable("users", {
  ...reusableColumns,
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
});

export const sessions = pgTable("sessions", {
  ...reusableColumns,
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  ...reusableColumns,
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp({ withTimezone: true }),
  refreshTokenExpiresAt: timestamp({ withTimezone: true }),
  scope: text(),
  password: text(),
});

export const verifications = pgTable("verifications", {
  ...reusableColumns,
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});
