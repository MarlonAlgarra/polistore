import { db } from "@/db";
import { readJson, respond } from "@/lib/http";
import { getSessionUserId } from "@/lib/session";
import { placeOrder } from "@/services/orders";

// POST /api/orders { productId, quantity }: compra directa de un artículo (exige sesión)
export async function POST(request: Request) {
  return respond(async () => {
    const userId = await getSessionUserId();
    const { productId, quantity } = await readJson(request);
    const id = typeof productId === "number" ? productId : Number.NaN;
    return { order: await placeOrder(db, userId, [{ productId: id, quantity }]) };
  }, 201);
}
