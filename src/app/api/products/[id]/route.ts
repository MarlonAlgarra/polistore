import { db } from "@/db";
import { respond } from "@/lib/http";
import { getProduct } from "@/services/products";

// GET /api/products/:id: detalle y características del artículo
export async function GET(_request: Request, { params }: RouteContext<"/api/products/[id]">) {
  const { id } = await params;
  return respond(async () => ({ product: await getProduct(db, Number(id)) }));
}
