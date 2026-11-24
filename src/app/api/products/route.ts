import { db } from "@/db";
import { respond } from "@/lib/http";
import { searchProducts } from "@/services/products";

// GET /api/products?q=&marca=&talla=&color=&categoria=&precioMin=&precioMax= (precios en pesos)
export async function GET(request: Request) {
  return respond(async () => ({ products: await searchProducts(db, new URL(request.url).searchParams) }));
}
