import "@/lib/env-config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL!,
  },
});
