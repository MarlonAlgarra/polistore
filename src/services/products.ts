import { and, asc, eq, gte, like, lte, type SQL } from "drizzle-orm";
import type { Db } from "@/db";
import { products } from "@/db/schema";
import { ServiceError } from "@/lib/http";
import type { Product } from "@/types";

// Parámetro de la URL -> columna. El de talla se llama "talla" en el cliente y en la API.
const COLUMNS = { marca: products.brand, talla: products.size, color: products.color, categoria: products.category };
export type FilterOptions = Record<keyof typeof COLUMNS, string[]>;

export function parsePrice(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const pesos = Number(value);
  if (!Number.isFinite(pesos) || pesos < 0) throw new ServiceError("El rango de precio debe ser un número positivo.");
  return Math.round(pesos * 100);
}

// Todos los filtros presentes se combinan con AND (p. ej. color + rango de precio).
export function buildConditions(params: URLSearchParams): SQL[] {
  const conditions: SQL[] = [];
  const name = params.get("q")?.trim();
  if (name) conditions.push(like(products.name, `%${name}%`));
  for (const [param, column] of Object.entries(COLUMNS)) {
    const value = params.get(param)?.trim();
    if (value) conditions.push(eq(column, value));
  }
  const min = parsePrice(params.get("precioMin"));
  const max = parsePrice(params.get("precioMax"));
  if (min !== undefined) conditions.push(gte(products.priceCents, min));
  if (max !== undefined) conditions.push(lte(products.priceCents, max));
  return conditions;
}

export async function searchProducts(db: Db, params: URLSearchParams): Promise<Product[]> {
  return db.select().from(products).where(and(...buildConditions(params))).orderBy(asc(products.category), asc(products.name));
}

export async function getFilterOptions(db: Db): Promise<FilterOptions> {
  const entries = await Promise.all(Object.entries(COLUMNS).map(async ([param, column]) => {
    const rows = await db.selectDistinct({ value: column }).from(products).orderBy(asc(column));
    return [param, rows.map((row) => row.value)];
  }));
  return Object.fromEntries(entries);
}

export async function getProduct(db: Db, id: number): Promise<Product> {
  const [product] = Number.isInteger(id) ? await db.select().from(products).where(eq(products.id, id)) : [];
  if (!product) throw new ServiceError("El artículo no existe.", 404);
  return product;
}
