// Base de datos de pruebas: archivo SQLite temporal con las migraciones y el seed aplicados.
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import * as schema from "@/db/schema";
import { seedProducts } from "@/db/seed";

export async function createTestDb(): Promise<Db> {
  const file = pathToFileURL(join(tmpdir(), `polistore-test-${randomUUID()}.db`)).href;
  const db = drizzle(createClient({ url: file }), { schema });
  await migrate(db, { migrationsFolder: "src/db/migrations" });
  await seedProducts(db);
  return db;
}

export async function productByCode(db: Db, code: string) {
  const [product] = await db.select().from(schema.products).where(eq(schema.products.code, code));
  return product;
}
