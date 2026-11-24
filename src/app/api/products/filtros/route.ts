import { connection } from "next/server";
import { db } from "@/db";
import { respond } from "@/lib/http";
import { getFilterOptions } from "@/services/products";

// GET /api/products/filtros: valores disponibles para marca, talla, color y categoría
export async function GET() {
  await connection();
  return respond(() => getFilterOptions(db));
}
