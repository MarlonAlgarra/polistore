import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local: archivo SQLite (data/local.db). Producción en Vercel: base remota Turso (libSQL, compatible con SQLite).
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:data/local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
