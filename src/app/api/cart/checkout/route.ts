import { db } from "@/db";
import { readCart, saveCart } from "@/lib/cart-cookie";
import { respond } from "@/lib/http";
import { getSessionUserId } from "@/lib/session";
import { summarize } from "@/services/cart";
import { placeOrder } from "@/services/orders";

// POST /api/cart/checkout: confirma el pedido del carrito (exige sesión) y lo vacía
export async function POST() {
  return respond(async () => {
    const userId = await getSessionUserId();
    const { items } = await summarize(db, await readCart());
    const order = await placeOrder(db, userId, items.map((item) => ({ productId: item.id, quantity: item.quantity })));
    await saveCart({});
    return { order };
  }, 201);
}
