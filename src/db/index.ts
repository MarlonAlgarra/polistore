import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local: archivo SQLite (data/local.db). Producción en Vercel: base remota Turso (libSQL, compatible con SQLite).
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:data/local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export type Db = LibSQLDatabase<typeof schema>;

export const db: Db = drizzle(client, { schema });
