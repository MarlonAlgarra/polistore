// Carga los artículos iniciales del catálogo (temática Poli). Uso: pnpm db:seed
import { createClient } from "@libsql/client";
import { count } from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { readFileSync } from "node:fs";
import { products } from "./schema.ts";

const SEED_FILE = new URL("./productos.json", import.meta.url);

export async function seedProducts(db: LibSQLDatabase<Record<string, unknown>>) {
  const [{ total }] = await db.select({ total: count() }).from(products);
  if (total > 0) return 0;
  const items: (typeof products.$inferInsert)[] = JSON.parse(readFileSync(SEED_FILE, "utf8"));
  await db.insert(products).values(items);
  return items.length;
}

if (process.argv[1]?.endsWith("seed.ts")) {
  const client = createClient({ url: process.env.DATABASE_URL ?? "file:data/local.db", authToken: process.env.DATABASE_AUTH_TOKEN });
  seedProducts(drizzle(client)).then((n) => console.log(`Artículos insertados: ${n}`));
}
