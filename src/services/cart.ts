import { inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { products } from "@/db/schema";
import type { Cart } from "@/types";
import { validateQuantity } from "./orders";
import { getProduct } from "./products";

// Carrito guardado en una cookie httpOnly: { idArtículo: cantidad }. El servidor revalida todo al leerlo.
export type CartState = Record<string, number>;

export function parseCart(raw: string | undefined): CartState {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    if (value === null || typeof value !== "object") return {};
    return Object.fromEntries(Object.entries(value).filter(([id, qty]) => /^\d+$/.test(id) && Number.isInteger(qty) && qty > 0));
  } catch {
    return {};
  }
}

export async function setQuantity(db: Db, cart: CartState, productId: number, quantity: unknown, add: boolean) {
  const product = await getProduct(db, productId);
  const current = add ? (cart[productId] ?? 0) : 0;
  return { ...cart, [productId]: validateQuantity(quantity, Math.max(0, product.stock - current)) + current };
}

export const removeItem = (cart: CartState, productId: number): CartState =>
  Object.fromEntries(Object.entries(cart).filter(([id]) => id !== String(productId)));

// Los artículos que ya no existen se omiten del resumen y, por tanto, del pedido.
export async function summarize(db: Db, cart: CartState): Promise<Cart> {
  const ids = Object.keys(cart).map(Number);
  const rows = ids.length > 0 ? await db.select().from(products).where(inArray(products.id, ids)) : [];
  const items = rows.map(({ id, name, priceCents, stock, imageUrl }) =>
    ({ id, name, priceCents, stock, imageUrl, quantity: cart[id], subtotalCents: cart[id] * priceCents }));
  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: items.reduce((sum, item) => sum + item.subtotalCents, 0),
  };
}
