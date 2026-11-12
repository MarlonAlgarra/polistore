import { defineConfig } from "drizzle-kit";

// El dialecto "turso" (libSQL) sirve tanto para file:data/local.db como para Turso remoto.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:data/local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
