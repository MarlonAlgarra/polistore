import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, test } from "vitest";
import type { Db } from "@/db";
import { products } from "@/db/schema";
import { createTestDb } from "@/test/db";

let db: Db;
const base = { name: "X", brand: "Poli Sport", size: "M", color: "Azul", category: "Camisetas", stock: 1, imageUrl: "/x.svg", description: "x" };

beforeEach(async () => {
  db = await createTestDb();
});

describe("Módulo 1 - Catálogo de datos", () => {
  test("UT-CAT-01: el seed carga al menos 20 artículos con imagen, descripción, precio y existencias", async () => {
    const rows = await db.select().from(products);
    expect(rows.length).toBeGreaterThanOrEqual(20);
    for (const p of rows) {
      expect(p.imageUrl && p.description).toBeTruthy();
      expect(Number.isInteger(p.priceCents) && p.priceCents > 0 && p.stock >= 0).toBe(true);
    }
  });

  test("UT-CAT-02: el código del artículo es único y el precio es un entero en centavos", async () => {
    const [{ type }] = await db.all<{ type: string }>(sql`SELECT typeof(price_cents) AS type FROM products LIMIT 1`);
    expect(type).toBe("integer");
    await expect(db.insert(products).values({ ...base, code: "CAM-001", priceCents: 1000 })).rejects.toThrow();
    await expect(db.insert(products).values({ ...base, code: "NUEVO-01", priceCents: 599.5 })).rejects.toThrow();
    await expect(db.run(sql`INSERT INTO products (code, name, brand, size, color, category, price_cents, stock, image_url,
      description) VALUES ('NUEVO-02', 'X', 'Poli', 'M', 'Azul', 'Gorras', 'cincuenta', 1, '/x.svg', 'x')`)).rejects.toThrow();
  });
});
