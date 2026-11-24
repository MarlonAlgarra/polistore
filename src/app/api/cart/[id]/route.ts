import { db } from "@/db";
import { readCart, saveCart } from "@/lib/cart-cookie";
import { readJson, respond } from "@/lib/http";
import { removeItem, setQuantity, summarize } from "@/services/cart";

type Context = RouteContext<"/api/cart/[id]">;

async function change(request: Request, { params }: Context, add: boolean) {
  const id = Number((await params).id);
  const { quantity } = await readJson(request);
  return respond(async () => {
    const cart = await setQuantity(db, await readCart(), id, quantity, add);
    await saveCart(cart);
    return summarize(db, cart);
  });
}

// POST suma unidades, PUT fija la cantidad, DELETE quita el artículo.
export const POST = (request: Request, context: Context) => change(request, context, true);
export const PUT = (request: Request, context: Context) => change(request, context, false);

export async function DELETE(_request: Request, { params }: Context) {
  const id = Number((await params).id);
  return respond(async () => {
    const cart = removeItem(await readCart(), id);
    await saveCart(cart);
    return summarize(db, cart);
  });
}
